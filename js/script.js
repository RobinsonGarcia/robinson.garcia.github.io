document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const nomeAnimal = params.get("nome");
    const gridContainer = document.querySelector(".grid");
  
    if (nomeAnimal) {
      // Página animal.html: Carrega informações do animal específico
      function formatarNomeArquivo(nome) {
        return nome
          .toLowerCase()
          .normalize("NFD") // Remove acentos
          .replace(/[\u0300-\u036f]/g, "") // Remove marcas de diacríticos
          .replace(/\s+/g, "-") // Substitui espaços por "-"
          .replace(/[^a-z0-9\-]/g, ""); // Remove caracteres especiais, exceto "-"
      }
  
      const fileName = `animais/${formatarNomeArquivo(nomeAnimal)}.json`;
  
      fetch(fileName)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Animal não encontrado.");
          }
          return response.json();
        })
        .then((data) => {
          renderAnimalData(data);
        })
        .catch((error) => {
          document.querySelector("main").innerHTML = `<h1 class="text-center my-4">${error.message}</h1>`;
        });
    } else if (gridContainer) {
      // Página index.html: Lista todos os animais dinamicamente
      const animalsDirectory = "animais/";
  
      fetch(animalsDirectory)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Não foi possível carregar a lista de animais.");
          }
          return response.text();
        })
        .then((text) => {
          const parser = new DOMParser();
          const htmlDoc = parser.parseFromString(text, "text/html");
          const files = Array.from(htmlDoc.querySelectorAll("a"))
            .map((link) => link.href)
            .filter((href) => href.endsWith(".json"))
            .map((href) => href.split("/").pop());
  
          files.forEach((fileName) => {
            fetch(`${animalsDirectory}${fileName}`)
              .then((response) => {
                if (!response.ok) {
                  throw new Error(`Erro ao carregar ${fileName}`);
                }
                return response.json();
              })
              .then((animalData) => {
                createGridItem(animalData, gridContainer);
              })
              .catch((error) => {
                console.error(error.message);
              });
          });
        })
        .catch((error) => {
          console.error(error.message);
        });
    }
  });
  
  function renderAnimalData(data) {
    document.querySelector("h1").innerText = `${data.emoji} ${data.nome}`;
    document.querySelector("img").src = data.imagem;
  
    const indice = document.querySelector("#indice");
    const conteudo = document.querySelector("#conteudo");
  
    for (const [secao, texto] of Object.entries(data.secoes)) {
      const link = document.createElement("a");
      link.href = `#${secao.toLowerCase()}`;
      link.innerText = secao;
      link.classList.add("list-group-item", "list-group-item-action");
      indice.appendChild(link);
  
      const div = document.createElement("div");
      div.id = secao.toLowerCase();
      div.innerHTML = `<h2>${secao}</h2><p>${texto}</p>`;
      conteudo.appendChild(div);
    }
  }
  
  function createGridItem(animalData, gridContainer) {
    const gridItem = document.createElement("div");
    gridItem.classList.add("grid-item");
  
    gridItem.innerHTML = `
      <a href="animal.html?nome=${encodeURIComponent(animalData.nome)}">
        <img src="${animalData.imagem}" alt="${animalData.nome}">
        <p>${animalData.emoji} ${animalData.nome}</p>
      </a>
    `;
  
    gridContainer.appendChild(gridItem);
  }