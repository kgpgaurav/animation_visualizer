// Advanced Particle System implementation
// This module provides enhanced particle physics with forces, collisions and interactions

// Helper class for advanced particle physics
class AdvancedParticleSystem {
  constructor(config = {}) {
    // System configuration
    this.config = {
      gravity: config.gravity || 0,
      friction: config.friction || 0.99,
      bounds: config.bounds || null,
      collisions: config.collisions || false,
      collisionDamping: config.collisionDamping || 0.5,
      forceFields: config.forceFields || [],
      particleInteractions: config.particleInteractions || [],
      globalForces: config.globalForces || [],
      flowFields: config.flowFields || [],
      boundaries: config.boundaries || { type: 'none' }
    };
    
    // Particle collections
    this.particles = [];
    this.particleGroups = new Map(); // Map for particle interaction groups
  }
  
  // Add a particle to the system
  addParticle(particle) {
    this.particles.push(particle);
    
    // Add to interaction group if specified
    if (particle.interactionGroup) {
      if (!this.particleGroups.has(particle.interactionGroup)) {
        this.particleGroups.set(particle.interactionGroup, []);
      }
      this.particleGroups.get(particle.interactionGroup).push(particle);
    }
    
    return particle;
  }
  
  // Remove a particle from the system
  removeParticle(particle) {
    const index = this.particles.indexOf(particle);
    if (index !== -1) {
      this.particles.splice(index, 1);
      
      // Remove from interaction group if necessary
      if (particle.interactionGroup && this.particleGroups.has(particle.interactionGroup)) {
        const groupParticles = this.particleGroups.get(particle.interactionGroup);
        const groupIndex = groupParticles.indexOf(particle);
        if (groupIndex !== -1) {
          groupParticles.splice(groupIndex, 1);
        }
      }
    }
  }
  
  // Update all particles in the system
  update(deltaTime) {
    // Convert milliseconds to seconds for physics calculations
    const dt = deltaTime / 1000;
    
    // Apply forces to all particles
    this._applyForces(dt);
    
    // Update positions
    this._updatePositions(dt);
    
    // Handle collisions
    if (this.config.collisions) {
      this._handleCollisions();
    }
    
    // Handle boundaries
    this._handleBoundaries();
    
    // Remove dead particles
    this._removeDeadParticles();
    
    return this.particles;
  }
  
  // Apply all forces to particles
  _applyForces(dt) {
    // For each particle
    this.particles.forEach(particle => {
      // Apply gravity
      if (this.config.gravity !== 0) {
        particle.vy += this.config.gravity * (particle.mass || 1) * dt;
      }
      
      // Apply friction/drag
      particle.vx *= this.config.friction;
      particle.vy *= this.config.friction;
      
      // Apply global forces
      this._applyGlobalForces(particle, dt);
      
      // Apply force fields
      this._applyForceFields(particle, dt);
      
      // Apply flow fields
      this._applyFlowFields(particle, dt);
      
      // Apply particle interactions
      this._applyParticleInteractions(particle, dt);
    });
  }
  
  // Apply global forces like wind or drag
  _applyGlobalForces(particle, dt) {
    this.config.globalForces.forEach(force => {
      switch (force.type) {
        case 'wind':
          particle.vx += force.x * dt;
          particle.vy += force.y * dt;
          break;
          
        case 'drag':
          // Air resistance proportional to velocity squared
          const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
          if (speed > 0) {
            const dragForceMagnitude = force.strength * speed * speed;
            const dragForceX = -particle.vx / speed * dragForceMagnitude;
            const dragForceY = -particle.vy / speed * dragForceMagnitude;
            
            particle.vx += dragForceX * dt;
            particle.vy += dragForceY * dt;
          }
          break;
          
        default:
          // Unknown force type, no action
          break;
      }
    });
  }
  
  // Apply force fields like attractors and repellers
  _applyForceFields(particle, dt) {
    this.config.forceFields.forEach(field => {
      // Calculate distance to field center
      const dx = field.x - particle.x;
      const dy = field.y - particle.y;
      const distSquared = dx * dx + dy * dy;
      const dist = Math.sqrt(distSquared);
      
      // Check if particle is within field radius
      if (dist <= field.radius) {
        // Normalize direction vector
        const nx = dx / dist;
        const ny = dy / dist;
        
        // Calculate force strength based on distance (inverse square law)
        // Full strength at center, reduces with distance
        const falloff = 1 - (dist / field.radius);
        const forceMagnitude = field.strength * falloff * (particle.mass || 1);
        
        switch (field.type) {
          case 'point':
            // Simple attractor/repeller
            particle.vx += nx * forceMagnitude * dt;
            particle.vy += ny * forceMagnitude * dt;
            break;
            
          case 'vortex':
            // Perpendicular force for vortex effect
            particle.vx += -ny * forceMagnitude * dt;
            particle.vy += nx * forceMagnitude * dt;
            break;
            
          case 'directional':
            // Force in specific direction
            particle.vx += field.directionX * forceMagnitude * dt;
            particle.vy += field.directionY * forceMagnitude * dt;
            break;
            
          default:
            // Unknown field type, no action
            break;
        }
      }
    });
  }
  
  // Apply flow fields (velocity fields)
  _applyFlowFields(particle, dt) {
    this.config.flowFields.forEach(field => {
      let velocityX = 0;
      let velocityY = 0;
      
      switch (field.type) {
        case 'circular':
          // Calculate angle to center
          const dx = particle.x - field.x;
          const dy = particle.y - field.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist <= field.radius && dist > 0) {
            // Normalize direction vector
            const nx = dx / dist;
            const ny = dy / dist;
            
            // Perpendicular direction for circular flow
            const falloff = 1 - (dist / field.radius);
            const strength = field.strength * falloff;
            
            if (field.clockwise) {
              velocityX = -ny * strength;
              velocityY = nx * strength;
            } else {
              velocityX = ny * strength;
              velocityY = -nx * strength;
            }
          }
          break;
          
        case 'wave':
          // Wave effect across the field
          const normalizedX = (particle.x - field.x) / field.width;
          // We calculate normalizedY but only use it for potential future enhancements
          const normalizedY = (particle.y - field.y) / field.height; // eslint-disable-line no-unused-vars
          
          // Calculate wave based on position and time
          const time = Date.now() / 1000 * field.speed;
          const angle = normalizedX * field.frequency * 2 * Math.PI + time;
          
          // Sine wave that affects y velocity
          velocityY = Math.sin(angle) * field.amplitude;
          
          // Optional: add slight x velocity based on wave gradient
          velocityX = Math.cos(angle) * field.amplitude * 0.2;
          break;
          
        default:
          // Unknown field type, no action
          break;
      }
      
      // Apply flow field velocity
      particle.vx += velocityX * dt;
      particle.vy += velocityY * dt;
    });
  }
  
  // Apply interactions between particles
  _applyParticleInteractions(particle, dt) {
    // Skip if no interactions defined or particle doesn't belong to a group
    if (this.config.particleInteractions.length === 0 || !particle.interactionGroup) {
      return;
    }
    
    this.config.particleInteractions.forEach(interaction => {
      // Check if this particle's group is involved in this interaction
      if (!interaction.groups.includes(particle.interactionGroup)) {
        return;
      }
      
      // Find the other group to interact with
      const sourceGroup = particle.interactionGroup;
      let targetGroups = [];
      
      if (interaction.groups.length === 1) {
        // Same group interaction
        targetGroups = [sourceGroup];
      } else {
        // Different groups interaction
        targetGroups = interaction.groups.filter(g => g !== sourceGroup);
        if (targetGroups.length === 0) {
          targetGroups = [sourceGroup]; // Fallback to same group
        }
      }
      
      // Collect all particles from target groups
      let targetParticles = [];
      targetGroups.forEach(group => {
        if (this.particleGroups.has(group)) {
          targetParticles = targetParticles.concat(this.particleGroups.get(group));
        }
      });
      
      // Apply interaction with each target particle
      targetParticles.forEach(target => {
        // Skip self
        if (target === particle) return;
        
        // Calculate distance
        const dx = target.x - particle.x;
        const dy = target.y - particle.y;
        const distSquared = dx * dx + dy * dy;
        const dist = Math.sqrt(distSquared);
        
        // Check distance constraints
        if (dist >= interaction.minDistance && dist <= interaction.maxDistance) {
          // Normalize direction
          const nx = dx / dist;
          const ny = dy / dist;
          
          // Calculate force magnitude with inverse square falloff
          const falloff = 1 - ((dist - interaction.minDistance) / 
                            (interaction.maxDistance - interaction.minDistance));
          const forceMagnitude = interaction.strength * falloff;
          
          // Apply appropriate force based on interaction type
          switch (interaction.type) {
            case 'attract':
              particle.vx += nx * forceMagnitude * dt;
              particle.vy += ny * forceMagnitude * dt;
              break;
              
            case 'repel':
              particle.vx -= nx * forceMagnitude * dt;
              particle.vy -= ny * forceMagnitude * dt;
              break;
              
            case 'orbit':
              // Perpendicular force for orbital effect
              particle.vx += -ny * forceMagnitude * dt;
              particle.vy += nx * forceMagnitude * dt;
              break;
              
            default:
              // Unknown interaction type, no action
              break;
          }
        }
      });
    });
  }
  
  // Update particle positions based on velocity
  _updatePositions(dt) {
    this.particles.forEach(particle => {
      // Update position
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      
      // Update life
      if (particle.life !== undefined) {
        particle.life -= dt / particle.maxLife;
        
        // Update opacity if fading out
        if (particle.fadeOut) {
          particle.opacity = particle.initialOpacity * particle.life;
        }
        
        // Update size if shrinking
        if (particle.shrink) {
          particle.size = particle.initialSize * particle.life;
        }
      }
    });
  }
  
  // Handle collisions between particles
  _handleCollisions() {
    // Simple O(n²) collision detection
    for (let i = 0; i < this.particles.length; i++) {
      const p1 = this.particles[i];
      
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        
        // Calculate distance
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distSquared = dx * dx + dy * dy;
        
        // Calculate minimum distance (sum of radii)
        const minDist = p1.size + p2.size;
        const minDistSquared = minDist * minDist;
        
        // Check for collision
        if (distSquared < minDistSquared) {
          // Calculate collision response
          const dist = Math.sqrt(distSquared);
          const nx = dx / dist;
          const ny = dy / dist;
          
          // Calculate relative velocity
          const vx = p2.vx - p1.vx;
          const vy = p2.vy - p1.vy;
          
          // Calculate relative velocity in terms of normal direction
          const velAlongNormal = vx * nx + vy * ny;
          
          // Do not resolve if velocities are separating
          if (velAlongNormal > 0) continue;
          
          // Calculate restitution (bounciness)
          const restitution = this.config.collisionDamping;
          
          // Calculate impulse scalar
          const m1 = p1.mass || 1;
          const m2 = p2.mass || 1;
          const impulseScalar = -(1 + restitution) * velAlongNormal / (1/m1 + 1/m2);
          
          // Apply impulse
          const impulseX = impulseScalar * nx;
          const impulseY = impulseScalar * ny;
          
          p1.vx -= impulseX / m1;
          p1.vy -= impulseY / m1;
          
          p2.vx += impulseX / m2;
          p2.vy += impulseY / m2;
          
          // Adjust positions to prevent overlap
          const overlap = minDist - dist;
          const adjustX = overlap * nx * 0.5;
          const adjustY = overlap * ny * 0.5;
          
          p1.x -= adjustX;
          p1.y -= adjustY;
          
          p2.x += adjustX;
          p2.y += adjustY;
        }
      }
    }
  }
  
  // Handle boundary interactions
  _handleBoundaries() {
    const bounds = this.config.bounds;
    if (!bounds) return;
    
    const boundaryType = this.config.boundaries.type || 'bounce';
    
    this.particles.forEach(particle => {
      switch (boundaryType) {
        case 'bounce':
          // Left boundary
          if (particle.x - particle.size < bounds.x) {
            particle.x = bounds.x + particle.size;
            particle.vx *= -this.config.collisionDamping;
          }
          // Right boundary
          else if (particle.x + particle.size > bounds.x + bounds.width) {
            particle.x = bounds.x + bounds.width - particle.size;
            particle.vx *= -this.config.collisionDamping;
          }
          
          // Top boundary
          if (particle.y - particle.size < bounds.y) {
            particle.y = bounds.y + particle.size;
            particle.vy *= -this.config.collisionDamping;
          }
          // Bottom boundary
          else if (particle.y + particle.size > bounds.y + bounds.height) {
            particle.y = bounds.y + bounds.height - particle.size;
            particle.vy *= -this.config.collisionDamping;
          }
          break;
          
        case 'wrap':
          // Wrap horizontally
          if (particle.x < bounds.x) {
            particle.x = bounds.x + bounds.width;
          } else if (particle.x > bounds.x + bounds.width) {
            particle.x = bounds.x;
          }
          
          // Wrap vertically
          if (particle.y < bounds.y) {
            particle.y = bounds.y + bounds.height;
          } else if (particle.y > bounds.y + bounds.height) {
            particle.y = bounds.y;
          }
          break;
          
        case 'kill':
          // Remove particles that go out of bounds
          if (particle.x < bounds.x - particle.size || 
              particle.x > bounds.x + bounds.width + particle.size ||
              particle.y < bounds.y - particle.size || 
              particle.y > bounds.y + bounds.height + particle.size) {
            particle.life = -1; // Mark for removal
          }
          break;
          
        default:
          // No boundary handling
          break;
      }
    });
  }
  
  // Remove dead particles
  _removeDeadParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      if (this.particles[i].life <= 0) {
        this.removeParticle(this.particles[i]);
      }
    }
  }
}

// Export the advanced particle system
export default AdvancedParticleSystem;