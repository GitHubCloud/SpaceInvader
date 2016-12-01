$(function () {
	var ratio = 10;
	var rem = (window.innerWidth / ratio);
	$("html").css("font-size", rem + "px");

	var level = 1;
	var score = 0;

	// 飞船类
	class Ship{
		constructor(){
			this.class = 'ship';
			this.html = '<div class="' + this.class + '"></div>';
			this.defaultCooldown = 500;
			this.cooldown = 0;
		}
		init(){
			$('body').append(this.html);
			this.dom = $('.' + this.class);
			this.dom.css({
				left: (ratio / 2 - 0.4) + 'rem',
				top: $(document).height() - this.dom.height()
			});
		}
		move(x){
			x -= (this.dom.width() / 2);
			this.dom.offset({ left: x });
		}
		attack(){
			if(this.cooldown != 0){ return false; }
			let bullet = new Bullet();
			bullet.init(this.dom);
			this.cooldown = this.defaultCooldown;

			var that = this;
			setTimeout(function () {
				that.cooldown = 0;
			}, that.defaultCooldown);
		}
	}

	// 入侵者类
	class Invader{
		constructor(){
			this.class = 'invader';
			this.html = '<div class="' + this.class + '"></div>';
			this.attackRate = (Math.random() * 5000) + 5000 - (level * 500);
			this.moveRate = 10000 - (level * 1000);
		}
		init(x, y){
			this.dom = $(this.html).appendTo('body');

			this.dom.css({
				left: x ? x : 0+'rem',
				top: y ? y : 0.5+'rem'
			});

			var that = this;
			var time = setInterval(function () {
				if(!that.dom.width()){
					clearInterval(time);
					return false;
				}
				that.attack();
			}, this.attackRate);
		}
		attack(){
			let bullet = new Bullet();
			bullet.init(this.dom);
		}
	}

	// Boss类
	class Boss{
		constructor(){
			this.class = 'boss';
			this.html = '<div class="boss"></div>';
			this.attackRate = 5000;
			this.defaultHealth = 20;
			this.health = 20;
		}
		init(){
			this.dom = $(this.html).appendTo('body');
			this.dom.css({
				left: ($(document).width() / 2) - (this.dom.width() / 2) + 'px',
				top: 0.5 + 'rem'
			});

			this.move();

			var that = this;
			var time = setInterval(function () {
				if(!that.dom.width()){
					clearInterval(time);
					return false;
				}
				that.attack();
			}, this.attackRate);
		}
		move(){
			if(!this.dom.width()){ return false; }
			var that = this;
			setTimeout(function () {
				that.dom.animate({
					left: (Math.random() * 12 - 2) * rem + 'px'
				}, 2000, 'swing', function () {
					that.move();
				});
			}, 500);
		}
		attack(){
			if(!this.dom.width()){ return false; }
			let that = this;
			for(let i=1; i<10; i++){
				setTimeout(function () {
					let bullet = new Bullet(8, 0.6, 1, '#00f');
					bullet.init(that.dom);
				}, i * 100);
			}
			this.dom.addClass('attack');
			setTimeout(function () {
				that.dom.removeClass('attack');
			}, 1000);
		}
	}

	// 子弹类
	class Bullet{
		constructor(speed, width, height, color){
			this.speed = speed ? speed : 5;
			this.width = width ? width : 0.04;
			this.height = height ? height : 0.2;
			this.color = color ? color : '#f00';
		}
		init(from){
			if(!from.width()){ return false; }

			let x = from.offset().left + (from.width() / 2);
			x -= (rem * this.width) / 2;
			let y = from.offset().top;

			if(from.hasClass('ship')){
				y += 0;
			}else{
				y += from.height();
			}

			let html = '<div class="bullet" style="';
			html += 'width:' + this.width + 'rem;';
			html += 'height:' + this.height + 'rem;';
			html += 'background:' + this.color + ';';
			html += 'left:' + x + 'px;';
			html += 'top:' + y + 'px;';
			html += '"></div>';

			this.dom = $(html).appendTo('body');

			let direction = from.hasClass('ship') ? 'up' : 'down';
			this.shot(direction);
		}
		shot(direction){
			let top = 0;
			switch(direction){
				case 'up':
					top = this.dom.offset().top - this.speed;
					break;
				case 'down':
					top = this.dom.offset().top + this.speed;
					break;
			}
			this.dom.offset({ top: top });

			if(this.checkHit(direction)){ return false; }
			if(this.checkMiss()){ return false;}

			var that = this;
			setTimeout(function () {
				that.shot(direction);
			}, 10);
		}
		checkHit(direction){
			let target;
			switch(direction){
				case 'up':
					target = $('.invader').length ? $('.invader') : $('.boss');
					break;
				case 'down':
					target = $('.ship');
					break;
			}

			let x1 = this.dom.offset().left;
			let y1 = this.dom.offset().top;
			let w1 = this.dom.width();
			let h1 = this.dom.height();
			for(let i=0; i<target.length; i++){
				let o = target.eq(i);
				let x2 = o.offset().left;
				let y2 = o.offset().top;
				let w2 = o.width();
				let h2 = o.height();

				let l1 = (x1 >= x2 && x1 >= x2 + w2);
				let l2 = (x2 <= x2 && x1 + w1 <= x2);
				let l3 = (y1 >= y2 && y1 >= y2 + h2);
				let l4 = (y1 <= y2 && y1 + h1 <= y2);
				if(l1 || l2 || l3 || l4){ continue; }

				handleHit(target);
				this.dom.remove();
				if(!target.eq(i).hasClass('boss')){
					target.eq(i).remove();
					if($('.invader').length <= 0){
						boss.init();
					}
				}
				return true;
			}
			return false;
		}
		checkMiss(){
			let top = this.dom.offset().top < 0;
			let down = this.dom.offset().top > $(window).height();
			if(top || down){
				this.dom.remove();
				return true;
			}
			return false;
		}
	}

	// 处理击中
	let handleHit = function (target) {
		if(target.hasClass('ship')){
			if(confirm('游戏结束！重新开始？')){
				location.reload(true);
			}
			return false;
		}else if(target.hasClass('boss')){
			score += 500;
			boss.health -= 1;
		}else{
			score += 100;
		}
		let scoreStr = score.toString();
		if(scoreStr.length < 9){
			for(let i=score.toString().length; i<9; i++){
				scoreStr = '0' + scoreStr;
			}
		}
		$('.score').text('Score: ' + scoreStr);

		if(boss.health <= 0){
			alert('老黄又一次被消灭了，你成功守护了地球的和平！');
			boss.dom.remove();
			boss.health = boss.defaultHealth;
			boss.defaultHealth += 10;
			generatorInvader();
			return false;
		}
	}

	// 临时生成敌人
	let generatorInvader = function () {
		let count = 0;
		while(count != 10){
			let invader = new Invader();
			invader.init(count + 'rem');
			count++;
		}
	}

	var boss = new Boss();
	var ship = new Ship();

	// 初始化游戏
	ship.init();
	generatorInvader();

	let scoreDom = $('<p class="score">Score: 000000000</p>').appendTo('body');

	$(window).mousemove(function (e) {
		let left = e.pageX ? e.pageX : e.clientX;
		ship.move(left);
	});

	$(window).click(function (e) {
		e.preventDefault();
		ship.attack();
	});
});