// Anonymous ID function for leaderboard
function getAnonID() {
    const id = crypto.randomUUID().replace(/-/g, "").substring(0, 8).toUpperCase();
    console.log("Generated anonymous ID:", id);
    return id;
}

/*==============================================================================
Init
==============================================================================*/
$.init = function() {

	// Read Source, PID, ID, and Condition from query string following Qualtrics redirect
	const params = new URLSearchParams(window.location.search);
	$.se = params.get("se") || "NO_SE";
	$.pid = params.get("pid") || "NO_PID";
	$.id = params.get("id") || "NO_ID";
	$.cd = params.get("cd") || "NO_COND";

	// Anonymous ID for leaderboard
	$.anon_id = getAnonID();

	$.setupStorage();
	$.wrap = document.getElementById( 'wrap' );
	$.wrapInner = document.getElementById( 'wrap-inner' );
	$.cbg1 = document.getElementById( 'cbg1' );
	$.cbg2 = document.getElementById( 'cbg2' );
	$.cbg3 = document.getElementById( 'cbg3' );
	$.cbg4 = document.getElementById( 'cbg4' );
	$.cmg = document.getElementById( 'cmg' );
	$.cfg = document.getElementById( 'cfg' );	
	$.ctxbg1 = $.cbg1.getContext( '2d' );
	$.ctxbg2 = $.cbg2.getContext( '2d' );
	$.ctxbg3 = $.cbg3.getContext( '2d' );
	$.ctxbg4 = $.cbg4.getContext( '2d' );
	$.ctxmg = $.cmg.getContext( '2d' );
	$.ctxfg = $.cfg.getContext( '2d' );
	$.cw = $.cmg.width = $.cfg.width = 800;
	$.ch = $.cmg.height = $.cfg.height = 600;
	$.wrap.style.width = $.wrapInner.style.width = $.cw + 'px';
	$.wrap.style.height = $.wrapInner.style.height = $.ch + 'px';
	$.wrap.style.marginLeft = ( -$.cw / 2 ) - 10 + 'px';
	$.wrap.style.marginTop = ( -$.ch / 2 ) - 10 + 'px';
	$.ww = Math.floor( $.cw * 2 );
	$.wh = Math.floor( $.ch * 2 );
	$.cbg1.width = Math.floor( $.cw * 1.1 );
	$.cbg1.height = Math.floor( $.ch * 1.1 );
	$.cbg2.width = Math.floor( $.cw * 1.15 );
	$.cbg2.height = Math.floor( $.ch * 1.15 );
	$.cbg3.width = Math.floor( $.cw * 1.2 );
	$.cbg3.height = Math.floor( $.ch * 1.2 );
	$.cbg4.width = Math.floor( $.cw * 1.25 );
	$.cbg4.height = Math.floor( $.ch * 1.25 );

	$.screen = {
		x: ( $.ww - $.cw ) / -2,
		y: ( $.wh - $.ch ) / -2
	};

	$.mute = $.storage['mute'];
	$.autofire = $.storage['autofire'];
	$.slowEnemyDivider = 3;	

	$.keys = {
		state: {
			up: 0,
			down: 0,
			left: 0,
			right: 0,
			f: 0,
			m: 0,
			p: 0
		},
		pressed: {
			up: 0,
			down: 0,
			left: 0,
			right: 0,
			f: 0,
			m: 0,
			p: 0
		}
	};
	$.okeys = {};
	$.mouse = {
		x: $.ww / 2,
		y: $.wh / 2,
		sx: 0,
		sy: 0,
		ax: window.innerWidth / 2,
		ay: 0,
		down: 0
	};
	$.buttons = [];

	$.minimap = {		
		x: 20,
		y: $.ch - Math.floor( $.ch * 0.1 ) - 20,
		width: Math.floor( $.cw * 0.1 ),
		height: Math.floor( $.ch * 0.1 ),
		scale: Math.floor( $.cw * 0.1 ) / $.ww,
		color: 'hsla(0, 0%, 0%, 0.85)',
		strokeColor: '#3a3a3a'
	},	
	$.cOffset = { 
		left: 0, 
		top: 0 
	};
	
	$.levelCount = $.definitions.levels.length;
	$.states = {};
	$.state = '';
	$.enemies = [];
	$.bullets = [];
	$.explosions = [];
	$.powerups = [];	
	$.particleEmitters = [];
	$.textPops = [];
	$.levelPops = [];
	$.powerupTimers = [];

	//creating an enemy type screen
	//$.showEnemyPopup = false;

	// Creating Enemy Names
	$.enemyNames = [
    "STRIDER",
    "CUTTER",
    "HUNTER",
    "SPLITTER",
    "WANDERER",
    "STEALTH HUNTER",
    "BRUTE",
    "STRIKER",
    "MUTANT HUNTER",
    "ORBITER",
    "SPAWNER"
	];

	// Create array for enemy type defeated
	$.enemyDefeatCount = new Array($.definitions.enemies.length).fill(0);

	$.resizecb();
	$.bindEvents();
	$.setupStates();	
	$.renderBackground1();
	$.renderBackground2();
	$.renderBackground3();
	$.renderBackground4();
	$.renderForeground();
	$.renderFavicon();
	$.setState( 'menu' );
	$.loop();
};

/*==============================================================================
Reset
==============================================================================*/
$.reset = function() {
	$.indexGlobal = 0;
	$.dt = 1;
	$.lt = Date.now();
	$.elapsed = 0;
	$.tick = 0;

	$.gameoverTick = 0;
	$.gameoverTickMax = 200;
	$.gameoverExplosion = 0;

	$.instructionTick = 0;
	$.instructionTickMax = 400;

	$.levelDiffOffset = 0;
	$.enemyOffsetMod = 0;
	$.slow = 0;

	$.screen = {
		x: ( $.ww - $.cw ) / -2,
		y: ( $.wh - $.ch ) / -2
	};
	$.rumble = {
		x: 0,
		y: 0,
		level: 0,
		decay: 0.4
	};	

	$.mouse.down = 0;

	$.level = {
		current: 0,
		kills: 0,
		killsToLevel: $.definitions.levels[ 0 ].killsToLevel,
		distribution: $.definitions.levels[ 0 ].distribution,
		distributionCount: $.definitions.levels[ 0 ].distribution.length
	};

	$.debugStats = true;
	$.exportedToQualtrics = false;

	$.enemies.length = 0;
	$.bullets.length = 0;
	$.explosions.length = 0;
	$.powerups.length = 0;
	$.particleEmitters.length = 0;
	$.textPops.length = 0;
	$.levelPops.length = 0;
	$.powerupTimers.length = 0;

	for( var i = 0; i < $.definitions.powerups.length; i++ ) {
		$.powerupTimers.push( 0 );
	}

	$.kills = 0;
	$.bulletsFired = 0;
	$.powerupsCollected = 0;
	$.score = 0;
	$.enemiesDefeated = 0;
	$.deaths = 0;
	$.buttonPresses = 0;
	$.upPresses = 0;
	$.downPresses = 0;
	$.leftPresses = 0;
	$.rightPresses = 0;
	$.mouseClicks = 0;
	$.mouseDistance = 0;
	$.distanceMoved = 0;
	$.totalXMovement = 0;
	$.totalYMovement = 0;
	$.lastMouseDistance = 0;

	$.timeIdle = 0;
	$.timeMoving = 0;
	$.timeAiming = 0;
	$.timeShooting = 0;
	$.timeAimingStill = 0;
	$.timeShootingStill = 0;
	$.timeAimingMoving = 0;
	$.timeShootingMoving = 0;

	//set time to 5 minutes
	$.timeLeft = 300;

	$.hero = new $.Hero();

	// Movement bounds (area explored)
	$.minX = $.hero.x;
	$.maxX = $.hero.x;
	$.minY = $.hero.y;
	$.maxY = $.hero.y;

	$.areaExplored = 0;
	$.visitedCells = new Set();
	$.cellSize = 10;
};

$.resetHero = function() {
    const $any = /** @type {any} */ ($);

    console.log("Life before resetHero:", $any.hero.life);

    $any.hero.life = 1;   // 
    console.log("Life after resetHero:", $any.hero.life);

    $any.hero.x = $.cw / 2;
    $any.hero.y = $.ch / 2;

	$any.hero.prevX = $any.hero.x;
	$any.hero.prevY = $any.hero.y;

    $any.hero.invincible = 1;
    $any.hero.invincibleTick = 120;
};

/*==============================================================================
Create Favicon
==============================================================================*/
$.renderFavicon = function() {
	var favicon = document.getElementById( 'favicon' ),
		favc = document.createElement( 'canvas' ),
		favctx = favc.getContext( '2d' ),
		faviconGrid = [
			[ 1, 1, 1, 1, 1,  ,  , 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
			[ 1,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  , 1 ],
			[ 1,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  , 1 ],
			[ 1,  ,  ,  ,  , 1, 1,  ,  , 1, 1, 1, 1, 1,  , 0 ],
			[ 1,  ,  ,  ,  , 1, 1,  ,  , 1, 1, 1, 1, 1,  , 0 ],
			[ 1,  ,  ,  ,  , 1, 1,  ,  , 1, 1,  ,  ,  ,  , 1 ],
			[ 1,  ,  ,  ,  , 1, 1,  ,  , 1, 1,  ,  ,  ,  , 1 ],
			[ 1,  ,  ,  ,  , 1, 1,  ,  , 1, 1,  ,  ,  ,  , 1 ],
			[ 1,  ,  ,  ,  , 1, 1,  ,  , 1, 1,  ,  ,  ,  , 1 ],
			[ 1,  ,  ,  ,  , 1, 1,  ,  , 1, 1,  ,  ,  ,  , 1 ],
			[ 1,  ,  ,  ,  , 1, 1,  ,  , 1, 1,  ,  ,  ,  , 1 ],
			[  ,  , 1, 1, 1, 1, 1,  ,  , 1, 1,  ,  ,  ,  , 1 ],
			[  ,  , 1, 1, 1, 1, 1,  ,  , 1, 1,  ,  ,  ,  , 1 ],
			[ 1,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  , 1 ],
			[ 1,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  , 1 ],
			[ 1, 1, 1, 1, 1, 1, 1, 1, 1,  ,  , 1, 1, 1, 1, 1 ]
		];
	favc.width = favc.height = 16;
	favctx.beginPath();
	for( var y = 0; y < 16; y++ ) {
		for( var x = 0; x < 16; x++ ) {
			if( faviconGrid[ y ][ x ] === 1 ) {
				favctx.rect( x, y, 1, 1 );
			}
		}
	}
	favctx.fill();
	favicon.href = favc.toDataURL();
};

/*==============================================================================
Render Backgrounds
==============================================================================*/
$.renderBackground1 = function() {
	var gradient = $.ctxbg1.createRadialGradient( $.cbg1.width / 2, $.cbg1.height / 2, 0, $.cbg1.width / 2, $.cbg1.height / 2, $.cbg1.height );
	gradient.addColorStop( 0, 'hsla(0, 0%, 100%, 0.1)' );
	gradient.addColorStop( 0.65, 'hsla(0, 0%, 100%, 0)' );
	$.ctxbg1.fillStyle = gradient;
	$.ctxbg1.fillRect( 0, 0, $.cbg1.width, $.cbg1.height );

	var i = 2000;
	while( i-- ) {
		$.util.fillCircle( $.ctxbg1, $.util.rand( 0, $.cbg1.width ), $.util.rand( 0, $.cbg1.height ), $.util.rand( 0.2, 0.5 ), 'hsla(0, 0%, 100%, ' + $.util.rand( 0.05, 0.2 ) + ')' );
	}

	var i = 800;
	while( i-- ) {
		$.util.fillCircle( $.ctxbg1, $.util.rand( 0, $.cbg1.width ), $.util.rand( 0, $.cbg1.height ), $.util.rand( 0.1, 0.8 ), 'hsla(0, 0%, 100%, ' + $.util.rand( 0.05, 0.5 ) + ')' );
	}
}

$.renderBackground2 = function() {
	var i = 80;
	while( i-- ) {
		$.util.fillCircle( $.ctxbg2, $.util.rand( 0, $.cbg2.width ), $.util.rand( 0, $.cbg2.height ), $.util.rand( 1, 2 ), 'hsla(0, 0%, 100%, ' + $.util.rand( 0.05, 0.15 ) + ')' );
	}
}

$.renderBackground3 = function() {
	var i = 40;
	while( i-- ) {
		$.util.fillCircle( $.ctxbg3, $.util.rand( 0, $.cbg3.width ), $.util.rand( 0, $.cbg3.height ), $.util.rand( 1, 2.5 ), 'hsla(0, 0%, 100%, ' + $.util.rand( 0.05, 0.1 ) + ')' );
	}
}

$.renderBackground4 = function() {
	var size = 50;
	$.ctxbg4.fillStyle = 'hsla(0, 0%, 50%, 0.05)';
	var i = Math.round( $.cbg4.height / size );
	while( i-- ) {
		$.ctxbg4.fillRect( 0, i * size + 25, $.cbg4.width, 1 );
	}
	i = Math.round( $.cbg4.width / size );
	while( i-- ) {
		$.ctxbg4.fillRect( i * size, 0, 1, $.cbg4.height );
	}
}

/*==============================================================================
Render Foreground
==============================================================================*/
$.renderForeground = function() {
	var gradient = $.ctxfg.createRadialGradient( $.cw / 2, $.ch / 2, $.ch / 3, $.cw / 2, $.ch / 2, $.ch );
	gradient.addColorStop( 0, 'hsla(0, 0%, 0%, 0)' );
	gradient.addColorStop( 1, 'hsla(0, 0%, 0%, 0.5)' );
	$.ctxfg.fillStyle = gradient;
	$.ctxfg.fillRect( 0, 0, $.cw, $.ch );

	$.ctxfg.fillStyle = 'hsla(0, 0%, 50%, 0.1)';
	var i = Math.round( $.ch / 2 );
	while( i-- ) {
		$.ctxfg.fillRect( 0, i * 2, $.cw, 1 );
	}

	var gradient2 = $.ctxfg.createLinearGradient( $.cw, 0, 0, $.ch );
	gradient2.addColorStop( 0, 'hsla(0, 0%, 100%, 0.04)' );
	gradient2.addColorStop( 0.75, 'hsla(0, 0%, 100%, 0)' );
	$.ctxfg.beginPath();
	$.ctxfg.moveTo( 0, 0 );
	$.ctxfg.lineTo( $.cw, 0 );
	$.ctxfg.lineTo( 0, $.ch );
	$.ctxfg.closePath();
	$.ctxfg.fillStyle = gradient2;
	$.ctxfg.fill();
}

/*==============================================================================
User Interface / UI / GUI / Minimap
==============================================================================*/

$.renderInterface = function() {
	/*==============================================================================
	Powerup Timers
	==============================================================================*/
		for( var i = 0; i < $.definitions.powerups.length; i++ ) {
			var powerup = $.definitions.powerups[ i ],
				powerupOn = ( $.powerupTimers[ i ] > 0 );
			$.ctxmg.beginPath();
			var powerupText = $.text( {
				ctx: $.ctxmg,
				x: $.minimap.x + $.minimap.width + 90,
				y: $.minimap.y + 4 + ( i * 12 ),
				text: powerup.title,
				hspacing: 1,
				vspacing: 1,
				halign: 'right',
				valign: 'top',
				scale: 1,
				snap: 1,
				render: 1
			} );
			if( powerupOn ) {
				$.ctxmg.fillStyle = 'hsla(0, 0%, 100%, ' + ( 0.25 + ( ( $.powerupTimers[ i ] / 300 ) * 0.75 ) ) + ')';
			} else {
				$.ctxmg.fillStyle = 'hsla(0, 0%, 100%, 0.25)';
			}
			$.ctxmg.fill();
			if( powerupOn ) {
				var powerupBar = {
					x: powerupText.ex + 5,
					y: powerupText.sy,
					width: 110,
					height: 5
				};
				$.ctxmg.fillStyle = 'hsl(' + powerup.hue + ', ' + powerup.saturation + '%, ' + powerup.lightness + '%)';
				$.ctxmg.fillRect( powerupBar.x, powerupBar.y, ( $.powerupTimers[ i ] / 300 ) * powerupBar.width, powerupBar.height );
			}
		}

		/*==============================================================================
		Instructions
		==============================================================================*/
		if( $.instructionTick < $.instructionTickMax ){
			$.instructionTick += $.dt;
			$.ctxmg.beginPath();
			$.text( {
				ctx: $.ctxmg,
				x: $.cw / 2 - 10,
				y: $.ch - 20,
				text: 'MOVE\nAIM/FIRE',
				hspacing: 1,
				vspacing: 17,
				halign: 'right',
				valign: 'bottom',
				scale: 2,
				snap: 1,
				render: 1
			} );
			if( $.instructionTick < $.instructionTickMax * 0.25 ) {
				var alpha = ( $.instructionTick / ( $.instructionTickMax * 0.25 ) ) * 0.5;
			} else if( $.instructionTick > $.instructionTickMax - $.instructionTickMax * 0.25 ) {
				var alpha = ( ( $.instructionTickMax - $.instructionTick ) / ( $.instructionTickMax * 0.25 ) ) * 0.5;
			} else {
				var alpha = 0.5;
			}
			alpha = Math.min( 1, Math.max( 0, alpha ) );
			
			$.ctxmg.fillStyle = 'hsla(0, 0%, 100%, ' + alpha + ')';
			$.ctxmg.fill();

			$.ctxmg.beginPath();
			$.text( {
				ctx: $.ctxmg,
				x: $.cw / 2 + 10,
				y: $.ch - 20,
				text: 'WASD/ARROWS\nMOUSE',
				hspacing: 1,
				vspacing: 17,
				halign: 'left',
				valign: 'bottom',
				scale: 2,
				snap: 1,
				render: 1
			} );
			if( $.instructionTick < $.instructionTickMax * 0.25 ) {
				var alpha = ( $.instructionTick / ( $.instructionTickMax * 0.25 ) ) * 1;
			} else if( $.instructionTick > $.instructionTickMax - $.instructionTickMax * 0.25 ) {
				var alpha = ( ( $.instructionTickMax - $.instructionTick ) / ( $.instructionTickMax * 0.25 ) ) * 1;
			} else {
				var alpha = 1;
			}
			alpha = Math.min( 1, Math.max( 0, alpha ) );
			
			$.ctxmg.fillStyle = 'hsla(0, 0%, 100%, ' + alpha + ')';
			$.ctxmg.fill();
		}

		/*==============================================================================
		Slow Enemies Screen Cover
		==============================================================================*/
		if( $.powerupTimers[ 1 ] > 0 ) {
			$.ctxmg.fillStyle = 'hsla(200, 100%, 20%, 0.05)';
			$.ctxmg.fillRect( 0, 0, $.cw, $.ch );
		}

	/*==============================================================================
	Health
	==============================================================================*/
	$.ctxmg.beginPath();
	var healthText = $.text( {
		ctx: $.ctxmg,
		x: 20,
		y: 20,
		text: 'HEALTH',
		hspacing: 1,
		vspacing: 1,
		halign: 'top',
		valign: 'left',
		scale: 2,
		snap: 1,
		render: 1
	} );
	$.ctxmg.fillStyle = 'hsla(0, 0%, 100%, 0.5)';
	$.ctxmg.fill();
	var healthBar = {
		x: healthText.ex + 10,
		y: healthText.sy,
		width: 110,
		height: 10
	};
	$.ctxmg.fillStyle = 'hsla(0, 0%, 20%, 1)';
	$.ctxmg.fillRect( healthBar.x, healthBar.y, healthBar.width, healthBar.height );
	$.ctxmg.fillStyle = 'hsla(0, 0%, 100%, 0.25)';
	$.ctxmg.fillRect( healthBar.x, healthBar.y, healthBar.width, healthBar.height / 2 );
	$.ctxmg.fillStyle = 'hsla(' + $.hero.life * 120 + ', 100%, 40%, 1)';
	$.ctxmg.fillRect( healthBar.x, healthBar.y, $.hero.life * healthBar.width, healthBar.height );
	$.ctxmg.fillStyle = 'hsla(' + $.hero.life * 120 + ', 100%, 75%, 1)';
	$.ctxmg.fillRect( healthBar.x, healthBar.y, $.hero.life * healthBar.width, healthBar.height / 2 );
	
	if( $.hero.takingDamage && $.hero.life > 0.01 ) {
		$.particleEmitters.push( new $.ParticleEmitter( {
			x: -$.screen.x + healthBar.x + $.hero.life * healthBar.width,
			y: -$.screen.y + healthBar.y + healthBar.height / 2,
			count: 1,
			spawnRange: 2,
			friction: 0.85,
			minSpeed: 2,
			maxSpeed: 20,
			minDirection: $.pi / 2 - 0.2,
			maxDirection: $.pi / 2 + 0.2,
			hue: $.hero.life * 120,
			saturation: 100
		} ) );
	}

	/*==============================================================================
	Progress
	==============================================================================*/
	$.ctxmg.beginPath();
	var progressText = $.text( {
		ctx: $.ctxmg,
		x: healthBar.x + healthBar.width + 40,
		y: 20,
		text: 'PROGRESS',
		hspacing: 1,
		vspacing: 1,
		halign: 'top',
		valign: 'left',
		scale: 2,
		snap: 1,
		// Setting render to 0 so that text PROGRESS does not display (other aspects of code rely on this variable so cannot remove entirely)
		render: 0
	} );
	$.ctxmg.fillStyle = 'hsla(0, 0%, 100%, 0.5)';
	$.ctxmg.fill();
	var progressBar = {
		x: progressText.ex + 10,
		y: progressText.sy,
		width: healthBar.width,
		height: healthBar.height
	};

	if( $.level.kills == $.level.killsToLevel ) {
		$.particleEmitters.push( new $.ParticleEmitter( {
			x: -$.screen.x + progressBar.x + progressBar.width,
			y: -$.screen.y + progressBar.y + progressBar.height / 2,
			count: 30,
			spawnRange: 5,
			friction: 0.95,
			minSpeed: 2,
			maxSpeed: 25,
			minDirection: 0,
			minDirection: $.pi / 2 - $.pi / 4,
			maxDirection: $.pi / 2 + $.pi / 4,
			hue: 0,
			saturation: 0
		} ) );
	}

	/*==============================================================================
	Enemies Defeated
	==============================================================================*/
	$.ctxmg.beginPath();
	var scoreLabel = $.text( {
		ctx: $.ctxmg,
		x: progressBar.x + progressBar.width + 100,
		y: 20,
		text: 'ENEMIES DEFEATED',
		hspacing: 1,
		vspacing: 1,
		halign: 'top',
		valign: 'left',
		scale: 2,
		snap: 1,
		render: 1
	} );
	$.ctxmg.fillStyle = 'hsla(0, 0%, 100%, 0.5)';
	$.ctxmg.fill();

	$.ctxmg.beginPath();
	var scoreText = $.text( {
		ctx: $.ctxmg,
		x: scoreLabel.ex + 10,
		y: 20,
		text: String($.enemiesDefeated),
		hspacing: 1,
		vspacing: 1,
		halign: 'top',
		valign: 'left',
		scale: 2,
		snap: 1,
		render: 1
	} );
	$.ctxmg.fillStyle = 'hsla(0, 0%, 100%, 1)';
	$.ctxmg.fill();

};

$.renderMinimap = function() {
	$.ctxmg.fillStyle = $.minimap.color;
	$.ctxmg.fillRect( $.minimap.x, $.minimap.y, $.minimap.width, $.minimap.height );

	$.ctxmg.fillStyle = 'hsla(0, 0%, 100%, 0.1)';
	$.ctxmg.fillRect( 
		Math.floor( $.minimap.x + -$.screen.x * $.minimap.scale ), 
		Math.floor( $.minimap.y + -$.screen.y * $.minimap.scale ), 
		Math.floor( $.cw * $.minimap.scale ), 
		Math.floor( $.ch * $.minimap.scale )
	);

	//$.ctxmg.beginPath();
	for( var i = 0; i < $.enemies.length; i++ ){
		var enemy = $.enemies[ i ],
			x = $.minimap.x + Math.floor( enemy.x * $.minimap.scale ),
			y = $.minimap.y + Math.floor( enemy.y * $.minimap.scale );
		if( $.util.pointInRect( x + 1, y + 1, $.minimap.x, $.minimap.y, $.minimap.width, $.minimap.height ) ) {
			//$.ctxmg.rect( x, y, 2, 2 );
			$.ctxmg.fillStyle = 'hsl(' + enemy.hue + ', ' + enemy.saturation + '%, 50%)';
			$.ctxmg.fillRect( x, y, 2, 2 );
		}
	}
	//$.ctxmg.fillStyle = '#f00';
	//$.ctxmg.fill();

	$.ctxmg.beginPath();
	for( var i = 0; i < $.bullets.length; i++ ){
		var bullet = $.bullets[ i ],
			x = $.minimap.x + Math.floor( bullet.x * $.minimap.scale ),
			y = $.minimap.y + Math.floor( bullet.y * $.minimap.scale );
		if( $.util.pointInRect( x, y, $.minimap.x, $.minimap.y, $.minimap.width, $.minimap.height ) ) {
			$.ctxmg.rect( x, y, 1, 1 );
		}
	}
	$.ctxmg.fillStyle = '#fff';
	$.ctxmg.fill();

	$.ctxmg.fillStyle = $.hero.fillStyle;
	$.ctxmg.fillRect( $.minimap.x + Math.floor( $.hero.x * $.minimap.scale ), $.minimap.y + Math.floor( $.hero.y * $.minimap.scale ), 2, 2 );

	$.ctxmg.strokeStyle = $.minimap.strokeColor;
	$.ctxmg.strokeRect( $.minimap.x - 0.5, $.minimap.y - 0.5, $.minimap.width + 1, $.minimap.height + 1 );
};

/*==============================================================================
Enemy Spawning
==============================================================================*/
$.getSpawnCoordinates = function( radius ) {
	var quadrant = Math.floor( $.util.rand( 0, 4 ) ),
		x,
		y,
		start;
	
	if( quadrant === 0){
		x = $.util.rand( 0, $.ww );
		y = -radius;
		start = 'top';
	} else if( quadrant === 1 ){
		x = $.ww + radius;
		y = $.util.rand( 0, $.wh );
		start = 'right';
	} else if( quadrant === 2 ) {
		x = $.util.rand( 0, $.ww );
		y = $.wh + radius;
		start = 'bottom';
	} else {
		x = -radius;
		y = $.util.rand( 0, $.wh );
		start = 'left';
	}

	return { x: x, y: y, start: start };
};

$.spawnEnemy = function( type ) {
	var params = $.definitions.enemies[ type ],
		coordinates = $.getSpawnCoordinates( params.radius );
	params.x = coordinates.x;
	params.y = coordinates.y;
	params.start = coordinates.start;
	params.type = type;
	return new $.Enemy( params );
};

$.spawnEnemies = function() {
	var floorTick = Math.floor( $.tick );
	for( var i = 0; i < $.level.distributionCount; i++ ) {
		var timeCheck = $.level.distribution[ i ];		
		if( $.levelDiffOffset > 0 ){
			timeCheck = Math.max( 1, timeCheck - ( $.levelDiffOffset * 2) );
		}
		if( floorTick % timeCheck === 0 ) {
			$.enemies.push( $.spawnEnemy( i ) );
		}
	}
};

/*==============================================================================
Events
==============================================================================*/
$.mousemovecb = function( e ) {
	e.preventDefault();

	// Calculate movement
	var dx = e.pageX - $.mouse.ax;
	var dy = e.pageY - $.mouse.ay;
	$.mouseDistance += Math.sqrt(dx*dx + dy*dy);

	$.mouse.ax = e.pageX;
	$.mouse.ay = e.pageY;
	$.mousescreen();
};

$.mousescreen = function() {
	$.mouse.sx = $.mouse.ax - $.cOffset.left;
	$.mouse.sy = $.mouse.ay - $.cOffset.top;
	$.mouse.x = $.mouse.sx - $.screen.x;
	$.mouse.y = $.mouse.sy - $.screen.y;
};

$.mousedowncb = function( e ) {
	e.preventDefault();
	$.mouse.down = 1;
	$.mouseClicks++;
};

$.mouseupcb = function( e ) {
	e.preventDefault();
	$.mouse.down = 0;
};

$.keydowncb = function( e ) {
	var e = ( e.keyCode ? e.keyCode : e.which );

    // UP
    if (e === 38 || e === 87) {
        if (!$.keys.state.up) {
			$.buttonPresses++;  // NEW press
			$.upPresses++;
		}
        $.keys.state.up = 1;
    }

    // DOWN
    if (e === 40 || e === 83) {
        if (!$.keys.state.down) {
			$.buttonPresses++;
			$.downPresses++;
		}
        $.keys.state.down = 1;
    }

    // LEFT
    if (e === 37 || e === 65) {
        if (!$.keys.state.left) {
			$.buttonPresses++;
			$.leftPresses++;
		}
        $.keys.state.left = 1;
    }

    // RIGHT
    if (e === 39 || e === 68) {
        if (!$.keys.state.right) {
			$.buttonPresses++;
			$.rightPresses++;
		}
        $.keys.state.right = 1;
    }

	// Adding E to toggle enemy type display
	//if( e === 69 ){ $.keys.state.e = 1; }
}

$.keyupcb = function( e ) {
	var e = ( e.keyCode ? e.keyCode : e.which );
	if( e === 38 || e === 87 ){ $.keys.state.up = 0; }
	if( e === 39 || e === 68 ){ $.keys.state.right = 0; }
	if( e === 40 || e === 83 ){ $.keys.state.down = 0; }
	if( e === 37 || e === 65 ){ $.keys.state.left = 0; }

	// Adding E to toggle enemy type display
	//if( e === 69 ){ $.keys.state.e = 0; }
}

$.resizecb = function( e ) {
	var rect = $.cmg.getBoundingClientRect();
	$.cOffset = {
		left: rect.left,
		top: rect.top
	}
}

$.bindEvents = function() {
	window.addEventListener( 'mousemove', $.mousemovecb );
	window.addEventListener( 'mousedown', $.mousedowncb );
	window.addEventListener( 'mouseup', $.mouseupcb );
	window.addEventListener( 'keydown', $.keydowncb );
	window.addEventListener( 'keyup', $.keyupcb );
	window.addEventListener( 'resize', $.resizecb );
	window.addEventListener( 'blur', $.blurcb );
};

/*==============================================================================
Draw Enemy Type Pop function
================================================================================*/

/*
// Draw Enemy Type Pop function
$.drawEnemyPopup = function() {
    var ctx = $.ctxmg;
    var w = $.cw, h = $.ch;

    // Background overlay
    ctx.fillStyle = "rgba(0,0,0,0.85)";
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.fillStyle = "#fff";
    ctx.font = "32px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Enemy Guide", w / 2, 60);

    // Dynamic grid
    var enemyCount = $.definitions.enemies.length;
    var cols = 3;
    var rows = Math.ceil(enemyCount / cols);

    var cellW = w / cols;
    var cellH = Math.floor((h - 150) / rows);

    // Target max display radius
    var targetMaxRadius = (cellH - 60) / 2;

    for (var i = 0; i < enemyCount; i++) {
        var col = i % cols;
        var row = Math.floor(i / cols);

        var cx = col * cellW + cellW / 2;
        var cy = 120 + row * (cellH + 15);

        var def = $.definitions.enemies[i];
        var name = $.enemyNames[i] || ("Enemy " + i);

        // Create preview enemy
        var preview = new $.Enemy({
            x: cx,
            y: cy - 10,
            hue: def.hue,
            radius: def.radius,
            speed: def.speed,
            life: def.life,
            value: def.value,
            saturation: def.saturation,
            lightness: def.lightness
        });

        // --- HYBRID SCALING ---
        var scale = targetMaxRadius / def.radius;

        // Clamp scale so small enemies don't shrink too much
        scale = Math.max(0.5, Math.min(scale, 1));

        // Render preview
        preview.renderPreview(ctx, cx, cy - 10, scale);

        // Name
        ctx.fillStyle = "#fff";
        ctx.font = "18px Arial";
        ctx.fillText(name, cx, cy + def.radius * scale + 25);
    }
};
*/

/*==============================================================================
Miscellaneous
==============================================================================*/
$.clearScreen = function() {
	$.ctxmg.clearRect( 0, 0, $.cw, $.ch );
};


$.updateDelta = function() { 
	var now = Date.now();
	$.realDt = (now - $.lt)/1000;
	$.dt = ( now - $.lt ) / ( 1000 / 60 );
	$.dt = ( $.dt < 0 ) ? 0.001 : $.dt;
	$.dt = ( $.dt > 10 ) ? 10 : $.dt;
	$.lt = now;
	$.elapsed += $.dt;
};

$.updateScreen = function() {
	var xSnap,
		xModify, 
		ySnap,
		yModify;

	if( $.hero.x < $.cw / 2 ) {
		xModify = $.hero.x / $.cw;
	} else if( $.hero.x > $.ww - $.cw / 2 ) {
		xModify = 1 - ( $.ww - $.hero.x ) / $.cw;
	} else {
		xModify = 0.5;		
	}

	if( $.hero.y < $.ch / 2 ) {
		yModify = $.hero.y / $.ch;
	} else if( $.hero.y > $.wh - $.ch / 2 ) {
		yModify = 1 - ( $.wh - $.hero.y ) / $.ch;
	} else {
		yModify = 0.5;		
	}

	xSnap = ( ( $.cw * xModify - $.hero.x ) - $.screen.x ) / 30;
	ySnap = ( ( $.ch * yModify - $.hero.y ) - $.screen.y ) / 30;	

	//ease to new coordinates
	$.screen.x += xSnap * $.dt;
	$.screen.y += ySnap * $.dt;

	// update rumble levels, keep X and Y changes consistent, apply rumble
	if( $.rumble.level > 0 ) {
		$.rumble.level -= $.rumble.decay;
		$.rumble.level = ( $.rumble.level < 0 ) ? 0 : $.rumble.level;			
		$.rumble.x = $.util.rand( -$.rumble.level, $.rumble.level );
		$.rumble.y = $.util.rand( -$.rumble.level, $.rumble.level );
	} else {
		$.rumble.x = 0;
		$.rumble.y = 0;
	}

	// animate background canvas
	$.cbg1.style.marginLeft = 
		-( ( $.cbg1.width - $.cw ) / 2 ) // half the difference from bg to viewport
		- ( ( $.cbg1.width - $.cw ) / 2 ) // half the diff again, modified by a percentage below
		* ( ( -$.screen.x - ( $.ww - $.cw ) / 2 ) / ( ( $.ww - $.cw ) / 2) ) // viewport offset applied to bg
		- $.rumble.x + 'px';
	$.cbg1.style.marginTop = 
		-( ( $.cbg1.height - $.ch ) / 2 ) 
		- ( ( $.cbg1.height - $.ch ) / 2 )
		* ( ( -$.screen.y - ( $.wh - $.ch ) / 2 ) / ( ( $.wh - $.ch ) / 2) ) 
		- $.rumble.y + 'px';
	$.cbg2.style.marginLeft = 
		-( ( $.cbg2.width - $.cw ) / 2 ) // half the difference from bg to viewport
		- ( ( $.cbg2.width - $.cw ) / 2 ) // half the diff again, modified by a percentage below
		* ( ( -$.screen.x - ( $.ww - $.cw ) / 2 ) / ( ( $.ww - $.cw ) / 2) ) // viewport offset applied to bg
		- $.rumble.x + 'px';
	$.cbg2.style.marginTop = 
		-( ( $.cbg2.height - $.ch ) / 2 ) 
		- ( ( $.cbg2.height - $.ch ) / 2 )
		* ( ( -$.screen.y - ( $.wh - $.ch ) / 2 ) / ( ( $.wh - $.ch ) / 2) ) 
		- $.rumble.y + 'px';
	$.cbg3.style.marginLeft = 
		-( ( $.cbg3.width - $.cw ) / 2 ) // half the difference from bg to viewport
		- ( ( $.cbg3.width - $.cw ) / 2 ) // half the diff again, modified by a percentage below
		* ( ( -$.screen.x - ( $.ww - $.cw ) / 2 ) / ( ( $.ww - $.cw ) / 2) ) // viewport offset applied to bg
		- $.rumble.x + 'px';
	$.cbg3.style.marginTop = 
		-( ( $.cbg3.height - $.ch ) / 2 ) 
		- ( ( $.cbg3.height - $.ch ) / 2 )
		* ( ( -$.screen.y - ( $.wh - $.ch ) / 2 ) / ( ( $.wh - $.ch ) / 2) ) 
		- $.rumble.y + 'px';
	$.cbg4.style.marginLeft = 
		-( ( $.cbg4.width - $.cw ) / 2 ) // half the difference from bg to viewport
		- ( ( $.cbg4.width - $.cw ) / 2 ) // half the diff again, modified by a percentage below
		* ( ( -$.screen.x - ( $.ww - $.cw ) / 2 ) / ( ( $.ww - $.cw ) / 2) ) // viewport offset applied to bg
		- $.rumble.x + 'px';
	$.cbg4.style.marginTop = 
		-( ( $.cbg4.height - $.ch ) / 2 ) 
		- ( ( $.cbg4.height - $.ch ) / 2 )
		* ( ( -$.screen.y - ( $.wh - $.ch ) / 2 ) / ( ( $.wh - $.ch ) / 2) ) 
		- $.rumble.y + 'px';

	$.mousescreen();
};

$.updateLevel = function() {

    var previousLevel = $.level.current;

    if ($.level.kills >= $.level.killsToLevel) {

        if ($.level.current + 1 < $.levelCount) {

            $.level.current++;
            $.level.kills = 0;
            $.level.killsToLevel = $.definitions.levels[$.level.current].killsToLevel;
            $.level.distribution = $.definitions.levels[$.level.current].distribution;
            $.level.distributionCount = $.level.distribution.length;

        } else {

            // clamp to final level (10)
            $.level.current = 10;
            $.level.kills = 0;
        }

        $.levelDiffOffset = $.level.current + 1 - $.levelCount;
    }
};

$.updatePowerupTimers = function() {
	// HEALTH
	if( $.powerupTimers[ 0 ] > 0 ){
		if( $.hero.life < 1 ) {
			$.hero.life += 0.001;
		}
		if( $.hero.life > 1 ) {
			$.hero.life = 1;
		}
		$.powerupTimers[ 0 ] -= $.dt;
	}

	// SLOW ENEMIES
	if( $.powerupTimers[ 1 ] > 0 ){
		$.slow = 1;
		$.powerupTimers[ 1 ] -= $.dt;
	} else {
		$.slow = 0;
	}

	// FAST SHOT
	if( $.powerupTimers[ 2 ] > 0 ){
		$.hero.weapon.fireRate = 2;
		$.hero.weapon.bullet.speed = 14;
		$.powerupTimers[ 2 ] -= $.dt;
	} else {
		$.hero.weapon.fireRate = 5;
		$.hero.weapon.bullet.speed = 10;
	}

	// TRIPLE SHOT
	if( $.powerupTimers[ 3 ] > 0 ){
		$.hero.weapon.count = 3;
		$.powerupTimers[ 3 ] -= $.dt;
	} else {
		$.hero.weapon.count = 1;
	}

	// PIERCE SHOT
	if( $.powerupTimers[ 4 ] > 0 ){
		$.hero.weapon.bullet.piercing = 1;
		$.powerupTimers[ 4 ] -= $.dt;
	} else {
		$.hero.weapon.bullet.piercing = 0;
	}
};	

$.spawnPowerup = function( x, y ) {
	if( Math.random() < 0.1 ) {
		var min = ( $.hero.life < 0.9 ) ? 0 : 1,
			type = Math.floor( $.util.rand( min, $.definitions.powerups.length ) ),
			params = $.definitions.powerups[ type ];
		params.type = type;
		params.x = x;
		params.y = y;
		$.powerups.push( new $.Powerup( params ) );
	}
};

/*==============================================================================
States
==============================================================================*/
$.setState = function( state ) {
	// handle clean up between states
	$.buttons.length = 0;

	if (state == 'menu') {
		$.mouse.down = 0;
		$.mouse.ax = 0;
		$.mouse.ay = 0;

		$.reset();

		// PLAY button moved down
		var playButton = new $.Button({
			x: $.cw / 2 + 1,
			y: $.ch / 2 + 180,
			lockedWidth: 299,
			lockedHeight: 49,
			scale: 3,
			title: 'PLAY',
			action: function() {
				$.reset();
				$.audio.play('levelup');
				$.setState('play');
			}
		});
		$.buttons.push(playButton);
	}

	$.states['gameover'] = function() {

		if (!$.scoreSubmitted){
			$.scoreSubmitted = true;
		
			console.log("Sending score to Supabase...", {
				anon_id: $.anon_id,
				enemies_defeated: $.enemiesDefeated
			});

			// submitting enemiesDefeated to leaderboard
			fetch("https://mfpdafbmceoyswgosmsm.supabase.co/rest/v1/CompLeaderboard", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mcGRhZmJtY2VveXN3Z29zbXNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNjc3OTgsImV4cCI6MjA5NDk0Mzc5OH0.v3DuxuzJ4Z9Q2MxohimoQqFafc_aezYOEQf3TE3yKKo",
				"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mcGRhZmJtY2VveXN3Z29zbXNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNjc3OTgsImV4cCI6MjA5NDk0Mzc5OH0.v3DuxuzJ4Z9Q2MxohimoQqFafc_aezYOEQf3TE3yKKo"
			},
			body: JSON.stringify({
				anon_id: $.anon_id,
				enemies_defeated: $.enemiesDefeated
			})
			})
			.then(async (r) => {
				console.log("Supabase response status:", r.status);
				const data = await r.json().catch(() => null);
				console.log("Supabase response body:", data);
			})
			.catch(err => {
				console.error("Supabase fetch error:", err);
			});

		}

		// reset any leftover transforms from gameplay
		$.ctxmg.setTransform(1, 0, 0, 1, 0, 0);

		$.clearScreen();

		// black background
		$.ctxmg.fillStyle = 'black';
		$.ctxmg.fillRect(0, 0, $.cw, $.ch);

		// GAME COMPLETE title
		$.ctxmg.fillStyle = '#fff';
		$.ctxmg.beginPath();
		var title1 = $.text({
			ctx: $.ctxmg,
			x: $.cw / 2,
			y: 180,
			text: 'GAME COMPLETE',
			hspacing: 3,
			vspacing: 1,
			halign: 'center',
			valign: 'bottom',
			scale: 10,
			snap: 1,
			render: 1
		});
		$.ctxmg.fill();

		// GAME COMPLETE title
		$.ctxmg.fillStyle = '#fff';
		$.ctxmg.beginPath();
		var title2 = $.text({
			ctx: $.ctxmg,
			x: $.cw / 2,
			y: title1.ey + 100,
			text: 'THANK YOU FOR PLAYING',
			hspacing: 3,
			vspacing: 1,
			halign: 'center',
			valign: 'bottom',
			scale: 6.5,
			snap: 1,
			render: 1
		});
		$.ctxmg.fill();

		// REDIRECT MESSAGE
		$.ctxmg.fillStyle = "#fff";
		$.ctxmg.font = "32px Arial";
		$.ctxmg.textAlign = "center";
		$.ctxmg.textBaseline = "top";

		$.ctxmg.fillText(
			"You will now be redirected back to the survey.",
			$.cw / 2,
			title2.ey + 130
		);

		$.ctxmg.fillText(
			"This may take a moment.",
			$.cw / 2,
			title2.ey + 190
		);
		
		// Game Data Block for exporting to Qualtrics
		const gameData = {
			pid: $.pid,
			cd: $.cd,
			se: $.se,
			enemies: $.enemiesDefeated,
			enemytypes: $.enemyDefeatCount,
			score: $.score,
			deaths: $.deaths,
			bullets: $.bulletsFired,
			powerups: $.powerupsCollected,
			timeidle: $.timeIdle,
			timemoving: $.timeMoving,
			timeaiming: $.timeAiming,
			timeshooting: $.timeShooting,
			timeaimingstill: $.timeAimingStill,
			timeshootingstill: $.timeShootingStill,
			timeaimingmoving: $.timeAimingMoving,
			timeshootingmoving: $.timeShootingMoving,
			movedistance: $.distanceMoved,
			areaexplored: $.areaExplored,
			movex: $.totalXMovement,
			movey: $.totalYMovement,
			minx: $.minX,
			maxx: $.maxX,
			miny: $.minY,
			maxy: $.maxY,
			button: $.buttonPresses,
			up: $.upPresses,
			down: $.downPresses,
			left: $.leftPresses,
			right: $.rightPresses,
			mouseclicks: $.mouseClicks,
			mousedistance: $.mouseDistance
		};

		// Redirect to second part of Qualtrics study with embedded values included
		const returnURL =
			"https://unioflimerick.eu.qualtrics.com/jfe/form/SV_9ZEGXM9BEz82kMC" +
			"?pid=" + encodeURIComponent($.pid) +
			"&id="	+ encodeURIComponent($.id) +
			"&anon_id=" + encodeURIComponent($.anon_id) +
			"&se=" + encodeURIComponent($.se) +
			"&cd=" + encodeURIComponent ($.cd)  +
			"&data=" + encodeURIComponent(JSON.stringify(gameData));
			
		window.location.href = returnURL;
	};

	// set state
	$.state = state;
};

$.setupStates = function() {
	$.states['menu'] = function() {
		$.clearScreen();
		$.updateScreen();

		var i = $.buttons.length; while( i-- ){ $.buttons[ i ].update( i ) }
			i = $.buttons.length; while( i-- ){ $.buttons[ i ].render( i ) }

		$.ctxmg.beginPath();
		var title = $.text( {
			ctx: $.ctxmg,
			x: $.cw / 2,
			y: $.ch / 2 - 100,
			text: 'RADIUS RAID',
			hspacing: 2,
			vspacing: 1,
			halign: 'center',
			valign: 'bottom',
			scale: 10,
			snap: 1,
			render: 1
		} );
		gradient = $.ctxmg.createLinearGradient( title.sx, title.sy, title.sx, title.ey );
		gradient.addColorStop( 0, '#fff' );
		gradient.addColorStop( 1, '#999' );
		$.ctxmg.fillStyle = gradient;
		$.ctxmg.fill();

        // Instruction text
        $.ctxmg.beginPath();
        $.text({
            ctx: $.ctxmg,
            x: $.cw / 2,
            y: $.ch / 2 + 40,   // adjust up/down if needed
            text: 'CLICK PLAY TO BEGIN THE GAME',
            hspacing: 1,
            vspacing: 1,
            halign: 'center',
            valign: 'middle',
            scale: 4,
            snap: 1,
            render: 1
        });
        $.ctxmg.fillStyle = '#ccc';
        $.ctxmg.fill();
	
		$.ctxmg.beginPath();
		var bottomInfo = $.text( {
			ctx: $.ctxmg,
			x: $.cw / 2,
			y: $.ch - 20,
			text: 'CREATED BY JACK RUGILE FOR JS13KGAMES 2013',
			hspacing: 1,
			vspacing: 1,
			halign: 'center',
			valign: 'bottom',
			scale: 1,
			snap: 1,
			render: 1
		} );
		$.ctxmg.fillStyle = '#666';
		$.ctxmg.fill();

	};

	$.states['play'] = function() {

		/*
		// ---Enemy Type Popup Toggle---
		if ($.keys.state.e && !$.okeys.e) {
			$.showEnemyPopup = !$.showEnemyPopup;
		}
		$.okeys.e = $.keys.state.e;

		// --- If popup is open, draw it and stop the game ---
		if ($.showEnemyPopup){
			$.drawEnemyPopup();
			return;
		}
		*/

		// Normal gameplay continues below
		$.updateDelta();
		$.updateScreen();
		$.updateLevel();
		$.updatePowerupTimers();
		$.spawnEnemies();
		$.enemyOffsetMod += ( $.slow ) ? $.dt / 3 : $.dt;
		
		// update entities	
		var i = $.enemies.length; while( i-- ){ $.enemies[ i ].update( i ) }
			i = $.explosions.length; while( i-- ){ $.explosions[ i ].update( i ) }
			i = $.powerups.length; while( i-- ){ $.powerups[ i ].update( i ) }
			i = $.particleEmitters.length; while( i-- ){ $.particleEmitters[ i ].update( i ) }
			i = $.textPops.length; while( i-- ){ $.textPops[ i ].update( i ) }
			i = $.bullets.length; while( i-- ){ $.bullets[ i ].update( i ) }
		$.hero.update();

		$.lastMouseDistance = $.mouseDistance;

		// countdown timer (real seconds)
		$.timeLeft -= $.realDt;
		if ($.timeLeft <= 0) {
			$.timeLeft = 0;
			$.setState('gameover');
			return;
		}

		// render entities
		$.clearScreen();
		$.ctxmg.save();
		$.ctxmg.translate( $.screen.x - $.rumble.x, $.screen.y - $.rumble.y );
		i = $.enemies.length; while( i-- ){ $.enemies[ i ].render( i ) }
		i = $.explosions.length; while( i-- ){ $.explosions[ i ].render( i ) }
		i = $.powerups.length; while( i-- ){ $.powerups[ i ].render( i ) }
		i = $.particleEmitters.length; while( i-- ){ $.particleEmitters[ i ].render( i ) }
		i = $.textPops.length; while( i-- ){ $.textPops[ i ].render( i ) }		
		i = $.bullets.length; while( i-- ){ $.bullets[ i ].render( i ) }
		$.hero.render();		
		$.ctxmg.restore();
		$.renderInterface();
		$.renderMinimap();

	// handle gameover / death / respawn
	if ($.hero.life <= 0) {
		
		// Explosion happens ONCE per death
		if (!$.gameoverExplosion) {

			$.audio.play('death');
			$.rumble.level = 25;

			// Increasing number of deaths by 1 every time health drops to zero (or below)
			$.deaths++;

			$.explosions.push(new $.Explosion({
				x: $.hero.x + $.util.rand(-10, 10),
				y: $.hero.y + $.util.rand(-10, 10),
				radius: 50,
				hue: 0,
				saturation: 0
			}));

			$.particleEmitters.push(new $.ParticleEmitter({
				x: $.hero.x,
				y: $.hero.y,
				count: 45,
				spawnRange: 10,
				friction: 0.95,
				minSpeed: 2,
				maxSpeed: 20,
				minDirection: 0,
				maxDirection: $.twopi,
				hue: 0,
				saturation: 0
			}));

			for (var i = 0; i < $.powerupTimers.length; i++) {
				$.powerupTimers[i] = 0;
			}

			$.gameoverExplosion = 1;
		}

		// Fade to black
		var alpha = (($.gameoverTick / $.gameoverTickMax) * 0.8);
		alpha = Math.min(1, Math.max(0, alpha));
		$.ctxmg.fillStyle = 'hsla(0, 100%, 0%, ' + alpha + ')';
		$.ctxmg.fillRect(0, 0, $.cw, $.ch);

		// After fade completes → respawn
		if ($.gameoverTick < $.gameoverTickMax) {
			$.gameoverTick += $.dt;
		} else {
			$.resetHero();
			$.gameoverTick = 0;
			$.gameoverExplosion = 0;
			console.log("STATE:", $.state);
			return; // CRITICAL: exit death handler
		}
	}

		// update tick	
		$.tick += $.dt;	
	};

	$.states['pause'] = function() {
		$.clearScreen();
		$.ctxmg.putImageData( $.screenshot, 0, 0 );

		$.ctxmg.fillStyle = 'hsla(0, 0%, 0%, 0.4)';
		$.ctxmg.fillRect( 0, 0, $.cw, $.ch );

		$.ctxmg.beginPath();
		var pauseText = $.text( {
			ctx: $.ctxmg,
			x: $.cw / 2,
			y: $.ch / 2 - 50,
			text: 'PAUSED',
			hspacing: 3,
			vspacing: 1,
			halign: 'center',
			valign: 'bottom',
			scale: 10,
			snap: 1,
			render: 1
		} );
		var gradient = $.ctxmg.createLinearGradient( pauseText.sx, pauseText.sy, pauseText.sx, pauseText.ey );
		gradient.addColorStop( 0, '#fff' );
		gradient.addColorStop( 1, '#999' );
		$.ctxmg.fillStyle = gradient;
		$.ctxmg.fill();

		var i = $.buttons.length; while( i-- ){ $.buttons[ i ].render( i ) }
			i = $.buttons.length; while( i-- ){ $.buttons[ i ].update( i ) }

		if( $.keys.pressed.p ){
			$.setState( 'play' );
		}
	};

}

/*==============================================================================
Loop
==============================================================================*/
$.loop = function() {
	requestAnimFrame( $.loop );

	// setup the pressed state for all keys
	for( var k in $.keys.state ) {
		if( $.keys.state[ k ] && !$.okeys[ k ] ) {
			$.keys.pressed[ k ] = 1;
		} else {
			$.keys.pressed[ k ] = 0;
		}
	}

	// run the current state

	$.states[ $.state ]();
	// always listen for mute toggle
	if( $.keys.pressed.m ){
		$.mute = ~~!$.mute;
		var i = $.audio.references.length;
		while( i-- ) {
			$.audio.references[ i ].volume = ~~!$.mute;
		}
		$.storage['mute'] = $.mute;
		$.updateStorage();
	}

	// move current keys into old keys
	$.okeys = {};
	for( var k in $.keys.state ) {
		$.okeys[ k ] = $.keys.state[ k ];
	}
};

/*==============================================================================
Start Game on Load
==============================================================================*/
window.addEventListener( 'load', function() {
	document.documentElement.className += ' loaded';
	$.init();
});