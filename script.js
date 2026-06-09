/**
 * BirdMatch Lima - Interactive Prototype
 * Keyboard navigation, accessibility enhancements, and improved event handling
 */

class BirdMatchApp {
  constructor() {
    this.profiles = [
      {
        emoji: "🦜",
        level: "🐣 Inicio",
        name: "Valeria, 22",
        bio: "Quiero aprender a identificar aves en parques. Llevo solo 2 meses explorando.",
        tags: [["colibríes", "teal"], ["parques", "green"], ["aprender", "amber"]],
        compat: 92
      },
      {
        emoji: "🦅",
        level: "🦅 Experto",
        name: "Rodrigo, 38",
        bio: "Ornitólogo aficionado. Conozco más de 80 especies limeñas y me gusta enseñar.",
        tags: [["halcones", "teal"], ["fotografía", "amber"], ["enseñar", "green"]],
        compat: 87
      },
      {
        emoji: "🦢",
        level: "🦉 Aficionado",
        name: "Daniela, 29",
        bio: "Fotógrafa de naturaleza. Busco compañía para recorridos mañaneros en humedales.",
        tags: [["aves marinas", "teal"], ["humedales", "green"], ["fotografía", "amber"]],
        compat: 78
      }
    ];

    this.matchIdeas = [
      {
        text: "Valeria quiere aprender.<br>Rodrigo quiere enseñar.",
        proposal: "<strong>📍</strong> Parque El Olivar<br><strong>🕖</strong> Sábado 7:00 a.m.<br><strong>🎯</strong> Identificar 10 especies"
      },
      {
        text: "Rodrigo conoce rutas.<br>Daniela quiere fotografiar aves.",
        proposal: "<strong>📍</strong> Pantanos de Villa<br><strong>🕖</strong> Domingo 6:30 a.m.<br><strong>🎯</strong> Crear una guía visual"
      },
      {
        text: "Daniela tiene cámara.<br>Valeria quiere practicar.",
        proposal: "<strong>📍</strong> Parque Kennedy<br><strong>🕖</strong> Viernes 5:00 p.m.<br><strong>🎯</strong> Registrar aves urbanas"
      }
    ];

    this.current = 0;
    this.matchShown = false;
    this.isAnimating = false;

    this.initializeElements();
    this.attachEventListeners();
    this.renderCard();
  }

  /**
   * Cache DOM elements
   */
  initializeElements() {
    this.elements = {
      card: document.getElementById("profile-card"),
      matchOverlay: document.getElementById("match-overlay"),
      btnDislike: document.getElementById("btn-dislike"),
      btnSuper: document.getElementById("btn-super"),
      btnLike: document.getElementById("btn-like"),
      continueBtn: document.getElementById("continue-btn"),
      cardEmoji: document.getElementById("card-emoji"),
      cardLevel: document.getElementById("card-level"),
      cardName: document.getElementById("card-name"),
      cardBio: document.getElementById("card-bio"),
      cardTags: document.getElementById("card-tags"),
      compatVal: document.getElementById("compat-val"),
      barFill: document.getElementById("bar-fill"),
      counter: document.getElementById("counter"),
      matchSub: document.getElementById("match-sub"),
      matchProposal: document.getElementById("match-proposal")
    };

    // Validate all elements exist
    Object.entries(this.elements).forEach(([key, element]) => {
      if (!element) {
        console.warn(`Missing element: ${key}`);
      }
    });
  }

  /**
   * Attach event listeners for buttons and keyboard
   */
  attachEventListeners() {
    // Button clicks
    this.elements.btnDislike.addEventListener("click", () => this.swipe("left"));
    this.elements.btnLike.addEventListener("click", () => this.swipe("right"));
    this.elements.btnSuper.addEventListener("click", () => this.showMatch());
    this.elements.continueBtn.addEventListener("click", () => this.nextCard());

    // Keyboard navigation
    document.addEventListener("keydown", (e) => this.handleKeyboard(e));

    // Announce keyboard hints to screen readers
    this.announceAccessibilityHints();
  }

  /**
   * Handle keyboard navigation
   * Arrow keys: Left/Right for swiping, Up for super
   * Number keys: 1 for dislike, 2 for super, 3 for like
   */
  handleKeyboard(event) {
    if (this.isAnimating) return;

    const handlers = {
      ArrowLeft: () => this.swipe("left"),
      ArrowRight: () => this.swipe("right"),
      ArrowUp: () => this.showMatch(),
      "1": () => this.swipe("left"),
      "2": () => this.showMatch(),
      "3": () => this.swipe("right"),
      Enter: () => this.matchShown ? this.nextCard() : null
    };

    if (handlers[event.key]) {
      event.preventDefault();
      handlers[event.key]();
    }
  }

  /**
   * Announce accessibility hints to screen readers
   */
  announceAccessibilityHints() {
    const hints = document.createElement("div");
    hints.className = "sr-only";
    hints.setAttribute("aria-live", "polite");
    hints.setAttribute("aria-atomic", "true");
    hints.textContent = "Puedes usar las flechas del teclado (← → ↑) o números (1, 2, 3) para interactuar. Presiona Enter cuando veas un match.";
    document.body.appendChild(hints);
  }

  /**
   * Render current profile card
   */
  renderCard() {
    const profile = this.profiles[this.current];

    this.elements.cardEmoji.textContent = profile.emoji;
    this.elements.cardLevel.textContent = profile.level;
    this.elements.cardName.textContent = profile.name;
    this.elements.cardBio.textContent = profile.bio;
    this.elements.compatVal.textContent = `${profile.compat}%`;
    this.elements.barFill.style.width = `${profile.compat}%`;
    this.elements.counter.textContent = `${this.current + 1} / ${this.profiles.length}`;

    // Clear and rebuild tags
    this.elements.cardTags.innerHTML = "";
    profile.tags.forEach(([text, color]) => {
      const span = document.createElement("span");
      span.className = `tag tag-${color}`;
      span.textContent = text;
      this.elements.cardTags.appendChild(span);
    });

    // Reset state
    this.elements.matchOverlay.classList.remove("visible");
    this.elements.card.classList.remove("swiping-left", "swiping-right");
    this.matchShown = false;

    // Announce profile update to screen readers
    this.announceProfile(profile);
  }

  /**
   * Announce profile details to screen readers
   */
  announceProfile(profile) {
    const announcement = `${profile.name}, ${profile.level}. ${profile.bio}`;
    this.announce(announcement);
  }

  /**
   * Generic announcement for screen readers
   */
  announce(message) {
    const announcement = document.createElement("div");
    announcement.className = "sr-only";
    announcement.setAttribute("aria-live", "polite");
    announcement.setAttribute("aria-atomic", "true");
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
  }

  /**
   * Move to next card
   */
  nextCard() {
    this.current = (this.current + 1) % this.profiles.length;
    this.isAnimating = false;
    this.renderCard();
  }

  /**
   * Swipe in specified direction
   */
  swipe(direction) {
    if (this.matchShown || this.isAnimating) return;

    this.isAnimating = true;
    const animationClass = direction === "left" ? "swiping-left" : "swiping-right";
    const action = direction === "left" ? "No compatible" : "Compatible";

    this.elements.card.classList.add(animationClass);
    this.announce(action);

    // Complete animation and move to next card
    setTimeout(() => this.nextCard(), 430);
  }

  /**
   * Show match overlay
   */
  showMatch() {
    if (this.isAnimating) return;

    const idea = this.matchIdeas[this.current];

    this.elements.matchSub.innerHTML = idea.text;
    this.elements.matchProposal.innerHTML = idea.proposal;
    this.elements.matchOverlay.classList.add("visible");
    this.matchShown = true;

    // Announce match to screen readers
    const matchText = `¡Es un match! ${idea.text.replace(/<br>/g, ". ")}`;
    this.announce(matchText);
  }
}

/**
 * Add screen reader only styles
 */
function initializeAccessibilityStyles() {
  const style = document.createElement("style");
  style.textContent = `
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border-width: 0;
    }

    /* Ensure focus indicators are always visible */
    :focus-visible {
      outline: 2px solid var(--green, #24734f);
      outline-offset: 2px;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Initialize app when DOM is ready
 */
document.addEventListener("DOMContentLoaded", () => {
  initializeAccessibilityStyles();
  new BirdMatchApp();
});
