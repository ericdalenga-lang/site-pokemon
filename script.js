const pokedexTrigger = document.querySelector('.pokedex-trigger');
const pokedexGrid = document.querySelector('#pokedex-grid');
const pokedexStatus = document.querySelector('#pokedex-status');
const pokemonSearch = document.querySelector('#pokemon-search');
const typeFilter = document.querySelector('#type-filter');

let alolaPokemon = [];

const typeNames = {
  bug: 'inseto',
  dark: 'sombrio',
  dragon: 'dragão',
  electric: 'elétrico',
  fairy: 'fada',
  fighting: 'lutador',
  fire: 'fogo',
  flying: 'voador',
  ghost: 'fantasma',
  grass: 'grama',
  ground: 'terrestre',
  ice: 'gelo',
  normal: 'normal',
  poison: 'veneno',
  psychic: 'psíquico',
  rock: 'pedra',
  steel: 'aço',
  water: 'água'
};

function formatName(name) {
  return name.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function renderPokemon(pokemonList) {
  if (!pokemonList.length) {
    pokedexGrid.innerHTML = '<p class="empty-state">Nenhum Pokémon encontrado.</p>';
    return;
  }

  pokedexGrid.innerHTML = pokemonList.map((pokemon) => {
    const types = pokemon.types.map(({ type }) => type.name);
    const typeLabel = types.map((type) => typeNames[type] || type).join(' · ');
    const number = String(pokemon.id).padStart(4, '0');
    const cardClass = types[0] ? `pokemon-card--${types[0]}` : '';

    return `
      <article class="pokemon-card ${cardClass}">
        <span class="pokemon-number">#${number}</span>
        <div class="pokemon-illustration">
          <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${formatName(pokemon.name)}">
        </div>
        <h3>${formatName(pokemon.name)}</h3>
        <p>${typeLabel}</p>
      </article>
    `;
  }).join('');
}

function updateResults() {
  const searchTerm = pokemonSearch.value.trim().toLowerCase();
  const selectedType = typeFilter.value;
  const filtered = alolaPokemon.filter((pokemon) => {
    const matchesName = pokemon.name.includes(searchTerm);
    const matchesType = selectedType === 'todos' || pokemon.types.some(({ type }) => type.name === selectedType);
    return matchesName && matchesType;
  });

  renderPokemon(filtered);
  pokedexStatus.textContent = `${filtered.length} Pokémon encontrado${filtered.length === 1 ? '' : 's'} em Alola.`;
}

async function loadAlolaPokemon() {
  pokedexTrigger.disabled = true;
  pokedexTrigger.setAttribute('aria-expanded', 'true');
  pokedexStatus.textContent = 'Carregando os Pokémon de Alola...';
  pokedexGrid.innerHTML = '<p class="empty-state is-loading">Consultando a Pokédex...</p>';

  try {
    const requests = Array.from({ length: 88 }, (_, index) => fetch(`https://pokeapi.co/api/v2/pokemon/${index + 722}`).then((response) => response.json()));
    alolaPokemon = await Promise.all(requests);
    const types = [...new Set(alolaPokemon.flatMap((pokemon) => pokemon.types.map(({ type }) => type.name)))].sort();
    typeFilter.innerHTML = '<option value="todos">Todos</option>' + types.map((type) => `<option value="${type}">${typeNames[type] || type}</option>`).join('');
    pokemonSearch.disabled = false;
    typeFilter.disabled = false;
    updateResults();
  } catch (error) {
    pokedexStatus.textContent = 'Não foi possível carregar a Pokédex agora. Verifique sua conexão e tente novamente.';
    pokedexStatus.classList.add('is-error');
    pokedexGrid.innerHTML = '<p class="empty-state">A Pokédex está temporariamente indisponível.</p>';
  } finally {
    pokedexTrigger.disabled = false;
  }
}

pokedexTrigger.addEventListener('click', loadAlolaPokemon);
pokemonSearch.addEventListener('input', updateResults);
typeFilter.addEventListener('change', updateResults);
pokemonSearch.disabled = true;
typeFilter.disabled = true;
