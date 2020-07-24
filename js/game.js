(function(){Box2D.Dynamics.b2Body.prototype.ApplyAngularImpulse = function(impulse)
{
	if (this.IsAwake() == false)
	{
		this.SetAwake(true);
	}
	this.m_angularVelocity += this.m_invI * impulse;
};function Box2DContactListener()
{
	Box2D.Dynamics.b2ContactListener.apply(this, arguments);

	this.BeginContact = function(contact)
	{
		var body_01 = contact.m_fixtureA.m_body;
		var body_02 = contact.m_fixtureB.m_body;

		body_01.collision.collide = true;

		body_01.collision.contacts_amount++;

		if (!body_01.collision.bodies.includes(body_01))
		{
			body_01.collision.bodies.push(body_01);
		}
		if (!body_01.collision.bodies.includes(body_02))
		{
			body_01.collision.bodies.push(body_02);
		}
		if (body_01.sensor)
		{
			body_01.sensor.collision.collide = true;

			body_01.sensor.collision.contacts_amount++;

			if (!body_01.sensor.collision.bodies.includes(body_01))
			{
				body_01.sensor.collision.bodies.push(body_01);
			}
			if (!body_01.sensor.collision.bodies.includes(body_02))
			{
				body_01.sensor.collision.bodies.push(body_02);
			}
		}
		body_02.collision.collide = true;

		body_02.collision.contacts_amount++;

		if (!body_02.collision.bodies.includes(body_02))
		{
			body_02.collision.bodies.push(body_02);
		}
		if (!body_02.collision.bodies.includes(body_01))
		{
			body_02.collision.bodies.push(body_01);
		}
		if (body_02.sensor)
		{
			body_02.sensor.collision.collide = true;

			body_02.sensor.collision.contacts_amount++;

			if (!body_02.sensor.collision.bodies.includes(body_01))
			{
				body_02.sensor.collision.bodies.push(body_01);
			}
			if (!body_02.sensor.collision.bodies.includes(body_02))
			{
				body_02.sensor.collision.bodies.push(body_02);
			}
		}
	};
	this.EndContact = function(contact)
	{
		var body_01 = contact.m_fixtureA.m_body;
		var body_02 = contact.m_fixtureB.m_body;

		body_01.collision.contacts_amount--;

		if (body_01.collision.bodies.includes(body_02))
		{
			body_01.collision.bodies.splice(body_02);
		}
		if (body_01.collision.bodies.length < 2)
		{
			body_01.collision.collide = false;
		}
		if (body_01.sensor)
		{
			body_01.sensor.collision.contacts_amount--;

			if (body_01.sensor.collision.bodies.includes(body_02))
			{
				body_01.sensor.collision.bodies.splice(body_02);
			}
			if (body_01.sensor.collision.bodies.length < 2)
			{
				body_01.sensor.collision.collide = false;
			}
		}
		body_02.collision.contacts_amount--;

		if (body_02.collision.bodies.includes(body_01))
		{
			body_02.collision.bodies.splice(body_01);
		}
		if (body_02.collision.bodies.length < 2)
		{
			body_02.collision.collide = false;
		}
		if (body_02.sensor)
		{
			body_02.sensor.collision.contacts_amount--;

			if (body_02.sensor.collision.bodies.includes(body_01))
			{
				body_02.sensor.collision.bodies.splice(body_01);
			}
			if (body_02.sensor.collision.bodies.length < 2)
			{
				body_02.sensor.collision.collide = false;
			}
		}

	};
}
Box2DContactListener.prototype = Object.create(Box2D.Dynamics.b2ContactListener.prototype);
Box2DContactListener.prototype.constructor = Box2DContactListener;
function Player(resources, game_canvas)
{
	var B2Vec2 = Box2D.Common.Math.b2Vec2;

	var _this = this;

	var on_ground = false;
	var speed_acc_timer;

	const MIN_SPEED = 10;
	const SPEED_ACC = 3;
	const BOOST_ACC = 400;
	const MAX_FLYING_Y = -10;
	const WEIGHT_AIR_V = new B2Vec2(0, 3);
	const WEIGHT_GROUND_V = new B2Vec2(0, 3);

	this.radius = 0;
	this.def_pos = { x: 0, y: 0 };
	this.active = true;

	Object.defineProperty(this, "x",
		{
			get:
				function()
				{
					return this.graphic.x;
				},
			set: function(value)
			{
				this.body.SetPosition(new B2Vec2(value / 50, this.body.GetPosition().y));

				this.graphic.x = this.body.GetPosition().x * 50;
			}
		}
	);
	Object.defineProperty(this, "y",
		{
			get:
				function()
				{
					return this.graphic.y;
				}
			,
			set: function(value)
			{
				this.body.SetPosition(new B2Vec2(this.body.GetPosition().x, value / 50));

				this.graphic.y = this.body.GetPosition().y * 50;
			}
		}
	);
	var body_def = new Box2D.Dynamics.b2BodyDef();
	body_def.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
	body_def.angularDamping = 1;

	var fix_def = new Box2D.Dynamics.b2FixtureDef();
	fix_def.shape = new Box2D.Collision.Shapes.b2CircleShape(0.6);
	fix_def.density = 5;
	fix_def.friction = 70;
	fix_def.restitution = 0;

	this.body = TinyWings.box2d_world.CreateBody(body_def);
	this.body.CreateFixture(fix_def);

	var ground_sensor_fix_def = new Box2D.Dynamics.b2FixtureDef();
	ground_sensor_fix_def.shape = new Box2D.Collision.Shapes.b2CircleShape(0.65);
	ground_sensor_fix_def.isSensor = true;
	ground_sensor_fix_def.collision = { collide: false, bodies: [], contacts_amount: 0 };
	this.body.CreateFixture(ground_sensor_fix_def);

	this.body.sensor = ground_sensor_fix_def;

	this.body.collision = { collide: false, bodies: [], contacts_amount: 0 };
	this.body.width = this.body.m_fixtureList.GetNext().m_shape.m_radius;
	this.body.height = this.body.m_fixtureList.m_shape.m_radius;

	this.graphic = new PIXI.Sprite(resources.player.texture);

	this.graphic.anchor.x = 0.5;
	this.graphic.anchor.y = 0.5;
	this.graphic.width = 65;
	this.graphic.height = 65;
	this.graphic.x = this.body.m_xf.position.x * 50;
	this.graphic.y = this.body.m_xf.position.y * 50;

	this.radius = Math.round(this.graphic.width / 2) - 5;

	function startMove(event)
	{
		speed_acc_timer = window.setInterval(increaseSpeed, 16);

		window.addEventListener("pointerup", stopIncreaseSpeed);
	}
	function increaseSpeed()
	{
		if (on_ground)
		{
			_this.body.ApplyAngularImpulse(SPEED_ACC);
		}
		_this.body.ApplyImpulse(WEIGHT_AIR_V, _this.body.m_xf.position);

		_this.graphic.width = _this.graphic.height = 70;
	}
	function stopIncreaseSpeed(event)
	{
		window.clearInterval(speed_acc_timer);

		_this.graphic.width = _this.graphic.height = 65;

		window.removeEventListener("pointerup", stopIncreaseSpeed);
	}
	this.update = function()
	{
		on_ground = this.body.sensor.collision.contacts_amount != 0;

		if (on_ground)
		{
			if (this.active)
			{
				_this.body.ApplyImpulse(WEIGHT_GROUND_V, _this.body.m_xf.position);

				if (this.body.m_angularVelocity < MIN_SPEED)
				{
					this.body.SetAngularVelocity(MIN_SPEED);
				}
			}
			else
			{
				this.body.SetActive(false);
			}
		}
		if (this.body.m_xf.position.y < MAX_FLYING_Y)
		{
			this.body.m_xf.position.y = MAX_FLYING_Y;
		}
		this.graphic.angle += (Math.atan2(this.body.m_linearVelocity.y, this.body.m_linearVelocity.x) * (180 / Math.PI) - this.graphic.angle) * 0.2;

		this.graphic.x = this.body.m_xf.position.x * 50;
		this.graphic.y = this.body.m_xf.position.y * 50 + 5;
	};
	this.boost = function()
	{
		this.body.ApplyAngularImpulse(BOOST_ACC);
	};
	this.start = function()
	{
		this.body.SetActive(true);

		this.active = true;

		this.body.collision.collide = false;
		this.body.collision.bodies.length = 0;
		this.body.collision.contacts_amount = 0;

		ground_sensor_fix_def.collision.collide = false;
		ground_sensor_fix_def.collision.bodies.length = 0;
		ground_sensor_fix_def.collision.contacts_amount = 0;

		this.body.SetLinearVelocity(new B2Vec2(0, 0));
		this.body.SetAngularVelocity(0);

		this.togglePlay(true);

		this.body.ApplyImpulse(new B2Vec2(10, 0), this.body.m_xf.position);
	};
	this.togglePlay = function(played)
	{
		if (played)
		{
			game_canvas.addEventListener("pointerdown", startMove);
		}
		else
		{
			game_canvas.removeEventListener("pointerdown", startMove);
		}
	};
	this.stop = function()
	{
		this.active = false;

		this.body.SetAngularVelocity(0);

		this.body.ApplyImpulse(new B2Vec2(0, 50), this.body.m_xf.position);

		game_canvas.removeEventListener("pointerdown", startMove);
	};

}function Hills(resources, pixi_world, player)
{
	var _this = this;

	var B2Vec2 = Box2D.Common.Math.b2Vec2;

	var body_def;
	var fix_def;
	var hills_segments_density_coef = 5;
	this.points = [];
	var hills_body_player_offset = player.body.width * 5;
	var peaks = [];
	var hills = [];
	var graphic_stroke;
	var graphic_mask;
	var graphic_part;
	var graphic_part_width;
	var graphic_part_offset;

	body_def = new Box2D.Dynamics.b2BodyDef();
	body_def.type = Box2D.Dynamics.b2Body.b2_staticBody;

	this.graphic = new PIXI.Container();

	graphic_stroke = new PIXI.Graphics();
	graphic_mask = new PIXI.Graphics();

	var texture = resources.hills.texture;

	this.ground_graphic_part_01 = new PIXI.Sprite(texture);
	this.ground_graphic_part_01.mask = graphic_mask;
	this.ground_graphic_part_01.x = -100;

	this.ground_graphic_part_02 = new PIXI.Sprite(texture);
	this.ground_graphic_part_02.mask = graphic_mask;

	graphic_part_width = this.ground_graphic_part_01.width;
	graphic_part_offset = graphic_part_width + Math.round(graphic_part_width / 5);

	this.graphic.addChild(graphic_mask);
	this.graphic.addChild(graphic_stroke);

	function makeShape()
	{
		var base_center = TinyWings.GAME_WORLD_HEIGHT / 2 + 50;
		var slope_width;
		var prev_point = peaks.length == 0 ? 0 : peaks[peaks.length - 1];

		if (peaks.length == 0)
		{
			peaks.push({ x: -10, y: base_center - 100 },
			{ x: 800, y: base_center + 100 },
			{ x: 800 + 500, y: base_center - 100 });
		}
		else
		{
			for (var i = 0; i <peaks.length; i++)
			{
				if (player.body.m_xf.position.x - peaks[i].x / 50 < 10)
				{
					peaks.splice(0, i);

					break;
				}
			}
		}
		var peaks_length = peaks.length;

		for (var i = peaks.length; i < peaks_length + 25; i += 2)
		{
			prev_point = peaks[i - 1];

			slope_width = 350 + (Math.ceil(Math.random() * 10) * 7);

			peaks.push({ x: prev_point.x + slope_width, y: base_center + (slope_width / 15 + (Math.ceil(Math.random() * 10) * 12)) },
				{ x: prev_point.x + slope_width * 2, y: base_center - (slope_width / 15 + (Math.ceil(Math.random() * 10) * 12)) });
		}
		var p0;
		var p1;
		var segments_amount;
		var dx;
		var da;
		var ymid;
		var ampl;

		_this.points = [];

		for (i = 1; i < peaks.length; i++)
		{
			p0 = peaks[i - 1];
			p1 = peaks[i];
			segments_amount = Math.floor((p1.x - p0.x) / hills_segments_density_coef);
			dx = (p1.x - p0.x) / segments_amount;
			da = Math.PI / segments_amount;
			ymid = (p0.y + p1.y) / 2;
			ampl = (p0.y - p1.y) / 2;

			for (var j = 0; j < segments_amount; j++)
			{
				_this.points.push({ x: p0.x + j * dx, y: ymid + ampl * Math.cos(da * j) });
			}
		}
	}
	function drawShape()
	{
		graphic_mask.clear();
		graphic_stroke.clear();

		graphic_mask.beginFill(0x000000);
		graphic_stroke.lineStyle(2.5, 0x000000);

		var point;
		var start_point;

		for (var i = 0; i < _this.points.length; i++)
		{
			point = _this.points[i];

			if (_this.points[i].x > _this.graphic.x)
			{
				if (!start_point)
				{
					graphic_mask.moveTo(_this.points[i].x - _this.graphic.x, _this.points[i].y);
					graphic_stroke.moveTo(_this.points[i].x - _this.graphic.x, _this.points[i].y);

					start_point = _this.points[i];
				}
				else
				{
					graphic_mask.lineTo(_this.points[i].x - _this.graphic.x, _this.points[i].y);
					graphic_stroke.lineTo(_this.points[i].x - _this.graphic.x, _this.points[i].y);
				}
				/*if (_this.points[i].x > _this.graphic.x + 3000)
				{
					break;
				}*/
			}
		}
		graphic_mask.lineTo(_this.points[i - 1].x - _this.graphic.x, 1000);
		graphic_mask.lineTo(start_point.x - _this.graphic.x, 1000);
		graphic_mask.lineTo(start_point.x - _this.graphic.x, start_point.y);

		graphic_stroke.lineTo(_this.points[i - 1].x - _this.graphic.x, 1000);
		graphic_stroke.lineTo(start_point.x - _this.graphic.x, 1000);
		graphic_stroke.lineTo(start_point.x - _this.graphic.x, start_point.y);
	}
	this.update = function()
	{
		makeHills();
		updateDrawing();
	};
	function makeHills()
	{
		var p0;
		var p1;
		var hill_body;
		var hill_body_is_exist;

		for (var i = 0; i < _this.points.length - 1; i++)
		{
			p0 = _this.points[i];

			if (p0.x / 50 > player.body.m_xf.position.x - hills_body_player_offset && p0.x / 50 < player.body.m_xf.position.x + hills_body_player_offset)
			{
				p1 = _this.points[i + 1];

				hill_body_is_exist = false;

				for (var j = 0; j < hills.length; j++)
				{
					hill_body = hills[j];

					if (hill_body.m_fixtureList.m_shape.m_vertices[0].x == p0.x / 50 && hill_body.m_fixtureList.m_shape.m_vertices[0].y == p0.y / 50 && hill_body.m_fixtureList.m_shape.m_vertices[1].x == p1.x / 50 && hill_body.m_fixtureList.m_shape.m_vertices[1].y == p1.y / 50)
					{
						hill_body_is_exist = true;

						break;
					}
				}
				if (!hill_body_is_exist)
				{
					fix_def = new Box2D.Dynamics.b2FixtureDef();
					fix_def.shape = new Box2D.Collision.Shapes.b2PolygonShape();
					fix_def.shape.SetAsEdge(new B2Vec2(_this.points[i].x / 50, _this.points[i].y / 50), new B2Vec2(_this.points[i + 1].x / 50, _this.points[i + 1].y / 50)
					);
					hill_body = TinyWings.box2d_world.CreateBody(body_def);
					hill_body.CreateFixture(fix_def);

					hill_body.collision = { collide: false, bodies: [], contacts_amount: 0 };

					hills.push(hill_body);
				}
			}
		}
		for (i = 0; i < hills.length; i++)
		{
			hill_body = hills[i];

			if (hill_body.m_fixtureList.m_shape.m_vertices[0].x < player.body.m_xf.position.x - hills_body_player_offset || hill_body.m_fixtureList.m_shape.m_vertices[0].x > player.body.m_xf.position.x + hills_body_player_offset)
			{
				hills.splice(i, 1);

				hill_body = TinyWings.box2d_world.DestroyBody(hill_body);

				i--;
			}
		}
		p0 = _this.points[_this.points.length - 1];

		if (p0.x / 50 - player.body.m_xf.position.x < 50)
		{
			makeShape();
			drawShape();
		}
	}
	function updateDrawing()
	{
		if (pixi_world.x - pixi_world.pivot.x < -(graphic_part.x + graphic_part_offset))
		{
			graphic_part.x += graphic_part_width * 2;

			graphic_part = graphic_part == _this.ground_graphic_part_01 ? _this.ground_graphic_part_02 : _this.ground_graphic_part_01;
		}
	}
	this.reset = function()
	{
		peaks.length = 0;
		this.points.length = 0;

		var hill_body;

		for (var i = 0; i < hills.length; i++)
		{
			hill_body = hills[i];

			hills.splice(i, 1);

			hill_body = TinyWings.box2d_world.DestroyBody(hill_body);

			i--;
		}
		makeShape();

		this.graphic.x = -100;


		this.ground_graphic_part_01.x = -100;
		this.ground_graphic_part_01.y = 50;

		this.ground_graphic_part_02.x = this.ground_graphic_part_01.x + graphic_part_width;
		this.ground_graphic_part_02.y = this.ground_graphic_part_01.y;

		graphic_part = this.ground_graphic_part_01;

		drawShape();
	};
	this.reset();

}function StartScreen()
{
	this.cont = document.querySelector("#start_screen");

	this.play_button = this.cont.querySelector("#start_screen__play_button");

	this.open = function(data)
	{
		this.cont.style.display = "flex";
	};
	this.close = function()
	{
		this.cont.style.display = "none";
	};
	this.play_button.addEventListener("click", this.close.bind(this));

}function GameOverScreen()
{
	this.cont = document.querySelector("#game_over_screen");

	var scores_label = this.cont.querySelector("#game_over_screen__scores_label");
	var coins_label = this.cont.querySelector("#game_over_screen__coins_label");
	var distance_label = this.cont.querySelector("#game_over_screen__distance_label");

	this.restart_button = this.cont.querySelector("#game_over_screen__restart_button");

	this.open = function(data)
	{
		scores_label.innerText = data.scores;
		coins_label.innerText = data.coins_amount;
		distance_label.innerText = data.distance + " m";

		this.cont.style.display = "block";
	};
	this.close = function()
	{
		this.cont.style.display = "none";
	};
	this.restart_button.addEventListener("click", this.close.bind(this));

}function TinyWings()
{
	var box2d_world;
	var pixi_app;
	var pixi_world;
	var pixi_resources;
	var player;
	var hills;
	var player_offset;
	var coins = [];
	var boosts = [];
	var timer;
	var add_coins_timer;
	var add_boost_timer;
	var next_coins_x;
	var next_boost_x;
	var scores = 0;
	var is_playing;
	var day_night_disk;
	var scores_label;
	var night_overlay;
	var play_button;
	var pause_button;
	var night_overlay_tween;
	var player_prev_pos;
	var coins_amount = 0;
	var start_screen;
	var game_over_screen;

	TinyWings.GAME_WORLD_WIDTH = 1000;
	TinyWings.GAME_WORLD_HEIGHT = 560;
	const GAME_TIME = 60;
	const DAY_NIGHT_DISC_ROTATION_STEP = 90 / GAME_TIME;
	const COIN_SIZE = 50;
	const BOOST_SIZE = 50;
	const COIN_RADIUS = Math.round(COIN_SIZE / 2);
	const BOOST_RADIUS = Math.round(BOOST_SIZE / 2);
	const METER_SCORE = 1;
	const COIN_SCORE = 100;

	TinyWings.cont = document.querySelector("#game");

	TinyWings.cont.hider = TinyWings.cont.querySelector("#game_screen_hider");

	box2d_world = new Box2D.Dynamics.b2World(new Box2D.Common.Math.b2Vec2(0, 10),  true);
	TinyWings.box2d_world = box2d_world;

	box2d_world.SetContactListener(new Box2DContactListener());

	day_night_disk = document.querySelector("#screen_02__day_night_disk");
	day_night_disk.angle = 0;

	scores_label = document.querySelector("#screen_02__scores_label");
	scores_label.innerText = scores;

	play_button = document.querySelector("#screen_02__play_button");
	pause_button = document.querySelector("#screen_02__pause_button");

	start_screen = new StartScreen();
	game_over_screen = new GameOverScreen();

	var game_canvas = document.querySelector("#game_canvas");

	updateLayout();

	PIXI.utils.skipHello();

	pixi_app = new PIXI.Application({
		view: game_canvas,
		resizeTo: game_canvas,
		backgroundColor: "0xD7E8FF"
	});

	TinyWings.pixi_app = pixi_app;

	play_button.addEventListener("click", togglePlay);
	pause_button.addEventListener("click", togglePlay);

	start_screen.play_button.addEventListener("click", startGame);

	game_over_screen.restart_button.addEventListener("click", startGame);

	window.addEventListener("load", init);
	window.addEventListener("resize", updateLayout);

	var fps_counter = document.querySelector("#fps_counter");

	function init(event)
	{
		pixi_app.loader.add("player", "assets/images/player.png");
		pixi_app.loader.add("hills", "assets/images/hills.png");
		pixi_app.loader.add("coin", "assets/images/coin.png");
		pixi_app.loader.add("boost", "assets/images/boost.png");

		pixi_app.loader.load(initGame);
	}
	function initGame(loader, resources)
	{
		pixi_world = new PIXI.Container();

		TinyWings.pixi_world = pixi_world;

		pixi_resources = resources;

		player = new Player(resources, game_canvas);

		player.graphic.angle = 15;
		player.graphic.x = 150;
		player.graphic.y = 223;

		hills = new Hills(resources, pixi_world, player);

		pixi_world.addChild(hills.ground_graphic_part_01);
		pixi_world.addChild(hills.ground_graphic_part_02);
		pixi_world.addChild(hills.graphic);
		pixi_world.addChild(player.graphic);

		pixi_app.stage.addChild(pixi_world);

		night_overlay = new PIXI.Graphics();

		night_overlay.beginFill(0x1F1F60, 0.9);
		night_overlay.drawRect(0, 0, pixi_app.screen.width, pixi_app.screen.height);
		night_overlay.endFill();

		pixi_app.ticker.add(update);

		timer = PIXI.timerManager.createTimer(1000);

		timer.repeat = GAME_TIME - 1;

		timer.on("repeat", timerTick);
		timer.on("end", gameOver);

		add_coins_timer = PIXI.timerManager.createTimer(1000);
		add_coins_timer.loop = true;

		add_boost_timer = PIXI.timerManager.createTimer(1000);
		add_boost_timer.loop = true;

		add_coins_timer.on("repeat", addCoins);

		add_boost_timer.on("repeat", addBoost);

		TinyWings.cont.hider.style.display = "none";

		updateLayout();
	}
	function startGame(event)
	{
		scores = 0;
		coins_amount = 0;

		player.x = 150;
		player.y = 217;
		player.def_pos.x = player.x;
		player.def_pos.y = player.y;

		player_prev_pos = player.x / 50;

		player.start();

		pixi_world.pivot.x = player.x;
		pixi_world.pivot.y = TinyWings.GAME_WORLD_HEIGHT;

		pixi_world.x = pixi_world.pivot.x;
		pixi_world.y = pixi_world.pivot.y;

		player_offset = { x: player.x, y: player.y };

		next_coins_x = player.body.m_xf.position.x * 50 + (10 * 50 + Math.ceil(Math.random() * 10) * (10 * 50));

		for (var i = 0; i < coins.length; i++)
		{
			coins[i].destroy( { children: true });

			coins.splice(i, 1);

			i--;
		}
		next_boost_x = player.body.m_xf.position.x * 50 + (10 * 50 + Math.ceil(Math.random() * 10) * (10 * 50));

		for (var i = 0; i < boosts.length; i++)
		{
			boosts[i].destroy( { children: true });

			boosts.splice(i, 1);

			i--;
		}
		night_overlay.alpha = 0;
		pixi_app.stage.removeChild(night_overlay);

		if (night_overlay_tween)
		{
			gsap.killTweensOf(night_overlay_tween);
		}
		night_overlay_tween = null;

		hills.reset();

		day_night_disk.angle = 0;
		day_night_disk.style.transform = "rotate(0deg)";

		timer.reset();
		timer.start();

		add_coins_timer.reset();
		add_coins_timer.start();

		add_boost_timer.reset();
		add_boost_timer.start();

		updateScores();

		if (!is_playing)
		{
			togglePlay();
		}
	}
	function update(time_delta)
	{
		if (is_playing)
		{
			box2d_world.Step(pixi_app.ticker.deltaMS / 1000, 10, 10);
			box2d_world.DrawDebugData();
			box2d_world.ClearForces();

			PIXI.timerManager.update();

			player.update();
			hills.update();

			checkCollisions();
			moveCamera();
			clearUnnecessaryObjects();
			updateScores();

			fps_counter.innerText = Math.round(pixi_app.ticker.FPS) + " FPS";

		}
	}
	function addCoins(elapsed, repeat)
	{
		if (player.body.m_xf.position.x * 50 > next_coins_x)
		{
			var amount = Math.ceil(Math.random() * 10);
			var coin;
			var p0;
			var p1;
			var angle;

			for (var i = 0; i < hills.points.length - 1; i++)
			{
				p0 = hills.points[i];

				if (p0.x > player.graphic.x + TinyWings.GAME_WORLD_WIDTH / pixi_world.scale.x + COIN_SIZE)
				{
					for (var j = 0; j < amount; j++)
					{
						try
						{
							p0 = hills.points[i + j * 20];
							p1 = hills.points[i + j * 20 + 1];

							coin = new PIXI.Sprite(pixi_resources.coin.texture);

							coin.anchor.set(0.5);
							coin.width = coin.height = COIN_SIZE;

							angle = Math.atan2(p1.y - p0.y, p1.x - p0.x) - 1.5708;

							coin.angle = (angle + 1.5708) * (180 / Math.PI);
							coin.x = p0.x + Math.round(Math.cos(angle) * COIN_SIZE / 1.5);
							coin.y = p0.y + Math.round(Math.sin(angle) * COIN_SIZE / 1.5);

							pixi_world.addChild(coin);

							coins.push(coin);
						}
						catch (error)
						{
							console.warn("Not enough hill segments for coins.", j + " from ", amount, " made");
						}
					}
					break;
				}
			}
			next_coins_x = player.body.m_xf.position.x * 50 + (10 * 50 + Math.ceil(Math.random() * 10) * (10 * 50));
		}
	}
	function addBoost(elapsed, repeat)
	{
		if (player.body.m_xf.position.x * 50 > next_boost_x)
		{
			var boost;
			var p0;
			var p1;
			var angle;

			for (var i = 0; i < hills.points.length - 1; i++)
			{
				p0 = hills.points[i];
				p1 = hills.points[i + 1];
				angle = Math.atan2(p1.y - p0.y, p1.x - p0.x);

				if (p0.x > player.graphic.x + TinyWings.GAME_WORLD_WIDTH / pixi_world.scale.x + BOOST_SIZE && angle > 0.69)
				{
					boost = new PIXI.Sprite(pixi_resources.boost.texture);

					boost.anchor.set(0.5);
					boost.width = boost.height = COIN_SIZE;

					angle -= 1.5708;

					boost.angle = (angle + 1.5708) * (180 / Math.PI);
					boost.x = p0.x + Math.round(Math.cos(angle) * COIN_SIZE / 1.5);
					boost.y = p0.y + Math.round(Math.sin(angle) * COIN_SIZE / 1.5);

					pixi_world.addChild(boost);

					boosts.push(boost);

					break;
				}
			}
			next_boost_x = player.body.m_xf.position.x * 50 + (10 * 50 + Math.ceil(Math.random() * 10) * (10 * 50));
		}
	}
	function checkCollisions()
	{
		var coin;
		var boost;
		var dist_x;
		var dist_y;

		for (var i = 0; i < coins.length; i++)
		{
			coin = coins[i];

			if (player.x > coin.x - COIN_SIZE * 3)
			{
				dist_x = player.x - coin.x;
				dist_y = player.y - coin.y;

				if (Math.sqrt(dist_x * dist_x + dist_y * dist_y) < player.radius + COIN_RADIUS)
				{
					coins_amount++;

					scores += COIN_SCORE;

					coin.destroy( { children: true });

					coins.splice(i, 1);

					i--;
				}
			}
		}
		for (var i = 0; i < boosts.length; i++)
		{
			boost = boosts[i];

			if (player.x > boost.x - BOOST_SIZE * 3)
			{
				dist_x = player.x - boost.x;
				dist_y = player.y - boost.y;

				if (Math.sqrt(dist_x * dist_x + dist_y * dist_y) < player.radius + BOOST_RADIUS)
				{
					player.boost();

					boost.destroy( { children: true });

					boosts.splice(i, 1);

					i--;
				}
			}
		}
	}
	function moveCamera()
	{
		pixi_world.pivot.x = player.x;

		var pixi_world_scale = pixi_app.screen.height / (160 - player.graphic.y + pixi_app.screen.height);

		if (pixi_world_scale > 1)
		{
			pixi_world_scale = 1;
		}
		pixi_world.scale.x = pixi_world.scale.y = pixi_world_scale;
	}
	function clearUnnecessaryObjects()
	{
		for (var i = 0; i < coins.length; i++)
		{
			if (coins[i].x < pixi_world.pivot.x - player_offset.x / pixi_world.scale.x - COIN_SIZE)
			{
				coins[i].destroy( { children: true });

				coins.splice(i, 1);

				i--;
			}
		}
		for (i = 0; i < boosts.length; i++)
		{
			if (boosts[i].x < pixi_world.pivot.x - player_offset.x / pixi_world.scale.x - BOOST_SIZE)
			{
				boosts[i].destroy( { children: true });

				boosts.splice(i, 1);

				i--;
			}
		}
	}
	function timerTick(elapsed, repeat)
	{
		day_night_disk.angle += DAY_NIGHT_DISC_ROTATION_STEP;
		day_night_disk.style.transform = "rotate(" + day_night_disk.angle + "deg)";

		if (GAME_TIME - repeat <= 10 && !night_overlay.parent)
		{
			pixi_app.stage.addChild(night_overlay);

			night_overlay_tween = gsap.to(night_overlay, { alpha: 1, duration: 9, ease: "power1.in" });
		}
	}
	function togglePlay()
	{
		is_playing = !is_playing;

		player.togglePlay(is_playing);

		if (is_playing)
		{
			pixi_app.ticker.start();
			pixi_app.start();

			timer.start();

			add_coins_timer.start();
			add_boost_timer.start();

			if (night_overlay_tween)
			{
				night_overlay_tween.paused(false);
			}
			play_button.style.display = "none";
			pause_button.style.display = "block";
		}
		else
		{
			pixi_app.ticker.stop();
			pixi_app.stop();

			timer.stop();

			add_coins_timer.stop();
			add_boost_timer.stop();

			if (night_overlay_tween)
			{
				night_overlay_tween.paused(true);
			}
			play_button.style.display = "block";
			pause_button.style.display = "none";
		}
		player.togglePlay(is_playing);
	}
	function updateScores()
	{
		scores += (player.body.m_xf.position.x - player_prev_pos) * METER_SCORE;

		player_prev_pos = player.body.m_xf.position.x;

		scores_label.innerText = Math.round(scores);
	}
	function gameOver(elapsed)
	{
		add_coins_timer.stop();
		add_boost_timer.stop();

		timerTick();

		player.stop();

		game_over_screen.open({ scores: Math.round(scores), coins_amount: coins_amount, distance: Math.round(player.body.m_xf.position.x) });
	}
	function updateLayout(event)
	{
		TinyWings.cont.style.width = TinyWings.GAME_WORLD_WIDTH + "px";
		TinyWings.cont.style.height = TinyWings.GAME_WORLD_HEIGHT + "px";
		TinyWings.cont.style.left = Math.round((window.innerWidth - TinyWings.GAME_WORLD_WIDTH) / 2) + "px";
		TinyWings.cont.style.top = 0 + "px";

		if (window.devicePixelRatio != 1 || (window.innerWidth < TinyWings.GAME_WORLD_WIDTH || window.innerHeight < TinyWings.GAME_WORLD_HEIGHT))
		{
			TinyWings.cont.style.width = window.innerWidth + "px";
			TinyWings.cont.style.height = window.innerHeight + "px";
			TinyWings.cont.style.left = 0 + "px";
			TinyWings.cont.style.top = 0 + "px";
		}
		if (pixi_app)
		{
			var game_cont_width = parseInt(TinyWings.cont.style.width, 10);
			var game_cont_height = parseInt(TinyWings.cont.style.height, 10);

			pixi_app.stage.scale.set(game_cont_width / 1000);
			pixi_app.stage.y = game_cont_height - 560 * pixi_app.stage.scale.x;

			night_overlay.clear();
			night_overlay.beginFill(0x1F1F60, 0.9);
			night_overlay.drawRect(0, 0, game_cont_width / pixi_app.stage.scale.x, game_cont_height / pixi_app.stage.scale.x);
			night_overlay.endFill();
			night_overlay.y = -pixi_app.stage.y / pixi_app.stage.scale.x;
		}
	}

}
new TinyWings();}());