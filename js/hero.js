/*==============================================================================
Init
==============================================================================*/
$.Hero = function() {
	this.x = $.ww / 2;
	this.y = $.wh / 2;

	// Track previous position for movement distance
	this.prevX = this.x;
	this.prevY = this.y;

	this.vx = 0;
	this.vy = 0;
	this.vmax = 4;
	this.vmax = 6;
	this.direction = 0;
	this.accel = 0.5;
	this.radius = 10;
	this.life = 1;
	this.takingDamage = 0;
	this.fillStyle = '#fff';
	this.weapon = {
		fireRate: 5,
		fireRateTick: 5,
		spread: 0.3,
		count: 1,
		bullet: {
			size: 15,
			lineWidth: 2,
			damage: 1,
			speed: 10,
			piercing: 0,
			strokeStyle: '#fff'
		},
		fireFlag: 0
	};	
};

/*==============================================================================
Update
==============================================================================*/
$.Hero.prototype.update = function() {
	if( this.life > 0 ) {

		if ($.state !== 'play') return;

		/*==============================================================================
		Apply Forces
		==============================================================================*/
		
		if( $.keys.state.up ) {
			this.vy -= this.accel * $.dt;
			if( this.vy < -this.vmax ) {
				this.vy = -this.vmax;
			}
		} else if( $.keys.state.down ) {
			this.vy += this.accel * $.dt;
			if( this.vy > this.vmax ) {
				this.vy = this.vmax;
			}
		}
		if( $.keys.state.left ) {
			this.vx -= this.accel * $.dt;
			if( this.vx < -this.vmax ) {
				this.vx = -this.vmax;
			}
		} else if( $.keys.state.right ) {
			this.vx += this.accel * $.dt;
			if( this.vx > this.vmax ) {
				this.vx = this.vmax;
			}
		}

		this.x += this.vx * $.dt;
		this.y += this.vy * $.dt;

		this.vy *= 0.9;
		this.vx *= 0.9;	
		
		// Movement distance tracking
		var mdx = this.x - this.prevX;
		var mdy = this.y - this.prevY;
		var dist = Math.sqrt(mdx*mdx + mdy*mdy);

		// Total distance
		$.distanceMoved += dist;
		
		// Directional totals
		$.totalXMovement += Math.abs(mdx);
		$.totalYMovement += Math.abs(mdy);

		/*========================================================
		Timing of play behaviours
		=========================================================*/

		const isMoving = dist >= 1.0;
		const mouseMoved = ($.mouseDistance - $.lastMouseDistance) >= 1;
		const isAiming = mouseMoved || $.mouse.down === 1;
		const isShooting = $.mouse.down === 1;
		
		// Determine if player is doing absolutely nothing (idle)
		if (!isMoving && !isAiming && !isShooting){
			$.timeIdle += $.realDt;
		}

		// Time moving
		if (isMoving){
			$.timeMoving += $.realDt;
		}
		
		// Time aiming
		if (isAiming){
			$.timeAiming += $.realDt;
		}

		// Time shooting
		if (isShooting){
			$.timeShooting += $.realDt;
		}

		// Time aiming while still
		if (!isMoving && isAiming && !isShooting){
			$.timeAimingStill += $.realDt;
		}

		// Time shooting while still
		if (!isMoving && isShooting){
			$.timeShootingStill += $.realDt;
		}

		// Time aiming while moving
		if (isMoving && isAiming && !isShooting){
			$.timeAimingMoving += $.realDt;
		}

		// Time shooting while moving
		if (isMoving && isShooting){
			$.timeShootingMoving += $.realDt;
		}		

		/*==============================================================================
		Establishing min and max of movement bounds
		===============================================================================*/

		// Movement bounds (area explored)
        if (this.x < $.minX) $.minX = this.x;
        if (this.x > $.maxX) $.maxX = this.x;
        if (this.y < $.minY) $.minY = this.y;
        if (this.y > $.maxY) $.maxY = this.y;

		/*==============================================================================
		Lock Bounds
		==============================================================================*/
		if( this.x >= $.ww - this.radius ) {
			this.x = $.ww - this.radius;
		}
		if( this.x <= this.radius ) {
			this.x = this.radius;
		}
		if( this.y >= $.wh - this.radius ) {
			this.y = $.wh - this.radius;
		}
		if( this.y <= this.radius ) {
			this.y = this.radius;
		}

		// Update previous position
		this.prevX = this.x;
        this.prevY = this.y;

		// Track explored grid cells using the actual gameplay canvas (800x600)
		const cellX = Math.floor(this.x / $.cellSize);
		const cellY = Math.floor(this.y / $.cellSize);

		// Clamp to valid world bounds (80x60 cells)
		const maxX = Math.floor($.ww / $.cellSize) - 1;  // 159
		const maxY = Math.floor($.wh / $.cellSize) - 1;  // 119

		const clampedX = Math.max(0, Math.min(cellX, maxX));
		const clampedY = Math.max(0, Math.min(cellY, maxY));

		const cellKey = clampedX + "," + clampedY;

		// Add to visited set
		$.visitedCells.add(cellKey);

		// Area explored = number of unique cells × area of each cell
		$.areaExplored = $.visitedCells.size * ($.cellSize * $.cellSize);

		/*==============================================================================
		Update Direction
		==============================================================================*/
		var dx = $.mouse.x - this.x,
			dy = $.mouse.y - this.y;
		this.direction = Math.atan2( dy, dx );

		/*==============================================================================
		Fire Weapon
		==============================================================================*/
		if( this.weapon.fireRateTick < this.weapon.fireRate ){
			this.weapon.fireRateTick += $.dt;
		} else {
			if( $.autofire || ( !$.autofire && $.mouse.down ) ){
				$.audio.play( 'shoot' );
				if( $.powerupTimers[ 2 ] > 0 || $.powerupTimers[ 3 ] > 0 || $.powerupTimers[ 4 ] > 0) {
					$.audio.play( 'shootAlt' );
				}

				this.weapon.fireRateTick = this.weapon.fireRateTick - this.weapon.fireRate;
				this.weapon.fireFlag = 6;

				if( this.weapon.count > 1 ) {
					var spreadStart = -this.weapon.spread / 2;
					var spreadStep = this.weapon.spread / ( this.weapon.count - 1 );
				} else {
					var spreadStart = 0;
					var spreadStep = 0;
				}

				var gunX = this.x + Math.cos( this.direction ) * ( this.radius + this.weapon.bullet.size );
				var gunY = this.y + Math.sin( this.direction ) * ( this.radius + this.weapon.bullet.size );

				for( var i = 0; i < this.weapon.count; i++ ) {
					$.bulletsFired++;
					var color = this.weapon.bullet.strokeStyle;
					if( $.powerupTimers[ 2 ] > 0 || $.powerupTimers[ 3 ] > 0 || $.powerupTimers[ 4 ] > 0) {
						var colors = [];
						if( $.powerupTimers[ 2 ] > 0 ) { colors.push( 'hsl(' + $.definitions.powerups[ 2 ].hue + ', ' + $.definitions.powerups[ 2 ].saturation + '%, ' + $.definitions.powerups[ 2 ].lightness + '%)' ); }
						if( $.powerupTimers[ 3 ] > 0 ) { colors.push( 'hsl(' + $.definitions.powerups[ 3 ].hue + ', ' + $.definitions.powerups[ 3 ].saturation + '%, ' + $.definitions.powerups[ 3 ].lightness + '%)' ); }
						if( $.powerupTimers[ 4 ] > 0 ) { colors.push( 'hsl(' + $.definitions.powerups[ 4 ].hue + ', ' + $.definitions.powerups[ 4 ].saturation + '%, ' + $.definitions.powerups[ 4 ].lightness + '%)' ); }
						color = colors[ Math.floor( $.util.rand( 0, colors.length ) ) ];
					}
					$.bullets.push( new $.Bullet( {					
						x: gunX,
						y: gunY,
						speed: this.weapon.bullet.speed,
						direction: this.direction + spreadStart + i * spreadStep,
						damage: this.weapon.bullet.damage,
						size: this.weapon.bullet.size,
						lineWidth: this.weapon.bullet.lineWidth,
						strokeStyle: color,
						piercing: this.weapon.bullet.piercing					
					} ) );
				}
			}
		}

		// Invincibility countdown
		if (this.invincible) {
			this.invincibleTick--;   // subtract 1 frame per update
			if (this.invincibleTick <= 0) {
				this.invincible = 0;
			}
		}


		/*==============================================================================
		Check Collisions
		==============================================================================*/
		this.takingDamage = 0;
		var ei = $.enemies.length;
		while (ei--) {
			var enemy = $.enemies[ei];

			if (
				enemy.inView &&
				$.util.distance(this.x, this.y, enemy.x, enemy.y) <= this.radius + enemy.radius
			) {

				// Ignore collisions while invincible
				if (!this.invincible) {

					$.particleEmitters.push(new $.ParticleEmitter({
						x: this.x,
						y: this.y,
						count: 2,
						spawnRange: 0,
						friction: 0.85,
						minSpeed: 2,
						maxSpeed: 15,
						minDirection: 0,
						maxDirection: $.twopi,
						hue: 0,
						saturation: 0
					}));

					this.takingDamage = 1;
					this.life -= 0.0075;
					$.rumble.level = 3;

					if (Math.floor($.tick) % 5 == 0) {
						$.audio.play('takingDamage');
					}
				}
			}
		}	
	}
};

/*==============================================================================
Render
==============================================================================*/
$.Hero.prototype.render = function() {
	if( this.life > 0 ) {

		var fillStyle = this.fillStyle;

		$.ctxmg.save();
		$.ctxmg.translate( this.x, this.y );
		$.ctxmg.rotate( this.direction - $.pi / 4 );
		$.ctxmg.fillStyle = fillStyle;
		$.ctxmg.fillRect( 0, 0, this.radius, this.radius );
		$.ctxmg.restore();

		$.ctxmg.save();
		$.ctxmg.translate( this.x, this.y );	
		$.ctxmg.rotate( this.direction - $.pi / 4 + $.twopi / 3 );
		$.ctxmg.fillStyle = fillStyle;
		$.ctxmg.fillRect( 0, 0, this.radius, this.radius );
		$.ctxmg.restore();

		$.ctxmg.save();
		$.ctxmg.translate( this.x, this.y );	
		$.ctxmg.rotate( this.direction - $.pi / 4 - $.twopi / 3 );
		$.ctxmg.fillStyle = fillStyle;
		$.ctxmg.fillRect( 0, 0, this.radius, this.radius );
		$.ctxmg.restore();

		$.util.fillCircle( $.ctxmg, this.x, this.y, this.radius - 3, fillStyle );
	}	
};