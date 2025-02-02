<template>
    <button class=" ripple-button button-container px-6 py-3" @click="combinedFunction">
      <slot></slot>
    </button>
</template>

<script setup>
const handleRippleEffect = (event) => {
  const button = event.currentTarget;
  const rect = button.getBoundingClientRect();

  // Créez l'élément de la vague
  const ripple = document.createElement('span');
  
  // Calculez la position du clic relative au bouton
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // Positionnez le span à la position du clic
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.className = 'ripple';
  
  // Ajoutez la vague dans le bouton
  button.appendChild(ripple);

  // Supprimez la vague une fois l'animation terminée
  ripple.addEventListener('animationend', () => {
    ripple.remove();
  });
};

const combinedFunction = (event) => {
  handleRippleEffect(event);
  // Vous pouvez ajouter ici d'autres actions à effectuer lors du clic
};
</script>

<style scoped>
.button-container {
  position: relative;
}

.glow-button {
  position: relative;
  background: linear-gradient(45deg, #22c55e, #b49000);
  border: none;
  color: #fff;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
  text-transform: uppercase;
  cursor: pointer;
  outline: none;
  border-radius: 8px;
  overflow: hidden;
  z-index: 1;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.glow-button:hover {
  background: linear-gradient(45deg, #b49000, #22c55e);
  color: #121212;
}

.glow-button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3), transparent);
  transform: translate(-50%, -50%) scale(0);
  transition: transform 0.5s ease, opacity 0.5s ease;
  border-radius: 50%;
  z-index: 0;
  opacity: 0.7;
}

.glow-button:hover::before {
  transform: translate(-50%, -50%) scale(1);
  opacity: 1;
}

.glow-button::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 8px;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0));
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 0;
}

.glow-button:hover::after {
  opacity: 1;
}
.ripple-button {
  position: relative;
  overflow: hidden;
}

/* L'effet ripple est appliqué aux éléments insérés dynamiquement */
.ripple-button::v-deep .ripple {
  position: absolute;
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  /* Pour centrer le span sur le point cliqué */
  transform: translate(-50%, -50%);
  pointer-events: none;
  /* Lancement de l'animation */
  animation: ripple-animation 0.6s ease-out forwards;
}

@keyframes ripple-animation {
  from {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0.8;
  }
  to {
    transform: translate(-50%, -50%) scale(15);
    opacity: 0;
  }
}
</style>
