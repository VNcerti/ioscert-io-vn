// components/particles-config.js - Premium Particles
export function initParticles() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  
  particlesJS("particles-js", {
    "particles": {
      "number": {
        "value": 80,
        "density": {
          "enable": true,
          "value_area": 1000
        }
      },
      "color": {
        "value": currentTheme === 'dark' ? "#ffffff" : "#0071e3"
      },
      "shape": {
        "type": "circle",
        "stroke": {
          "width": 0,
          "color": currentTheme === 'dark' ? "#000000" : "#000000"
        }
      },
      "opacity": {
        "value": 0.25,
        "random": true,
        "anim": {
          "enable": true,
          "speed": 0.5,
          "opacity_min": 0.1,
          "sync": false
        }
      },
      "size": {
        "value": 2,
        "random": true,
        "anim": {
          "enable": true,
          "speed": 1,
          "size_min": 0.5,
          "sync": false
        }
      },
      "line_linked": {
        "enable": true,
        "distance": 120,
        "color": currentTheme === 'dark' ? "#ffffff" : "#0071e3",
        "opacity": 0.15,
        "width": 0.8
      },
      "move": {
        "enable": true,
        "speed": 0.8,
        "direction": "none",
        "random": true,
        "straight": false,
        "out_mode": "out",
        "bounce": false,
        "attract": {
          "enable": false,
          "rotateX": 600,
          "rotateY": 1200
        }
      }
    },
    "interactivity": {
      "detect_on": "canvas",
      "events": {
        "onhover": {
          "enable": true,
          "mode": "grab"
        },
        "onclick": {
          "enable": false
        },
        "resize": true
      },
      "modes": {
        "grab": {
          "distance": 100,
          "line_linked": {
            "opacity": 0.3
          }
        },
        "repulse": {
          "distance": 70,
          "duration": 0.4
        }
      }
    },
    "retina_detect": true
  });
}

export function updateParticlesTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  
  if (window.pJSDom && window.pJSDom.length > 0) {
    const pJS = window.pJSDom[0].pJS;
    
    if (currentTheme === 'dark') {
      pJS.particles.color.value = "#ffffff";
      pJS.particles.line_linked.color = "#ffffff";
    } else {
      pJS.particles.color.value = "#0071e3";
      pJS.particles.line_linked.color = "#0071e3";
    }
    
    pJS.particles.line_linked.opacity = 0.15;
    pJS.fn.particlesRefresh();
  }
}