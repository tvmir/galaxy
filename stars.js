(function () {
  var canvas, webgl, run, res, prev, rect;
  var emitters = [];
  var emitterCount = 10500;
  var wrap = [];
  var wrapCount = 1;
  var wrapGrpCount = 1;
  var numOfWraps = wrapCount / wrapGrpCount;
  var stars = new Float32Array((wrapCount + emitterCount) * 2);
  var curr = Date.now();
  var delta = 0;
  var mouseX = 0;
  var mouseY = 0;
  var count = 0;
  var mouseClick = false;
  canvas = document.getElementById("canvas");
  document.addEventListener("mousedown", onMouseClick, false);
  document.addEventListener("mouseup", onMouseUnclick, false);
  document.addEventListener("mousemove", onMouseMove, false);

  function onMouseClick(e) {
    mouseClick = true;
  }

  function onMouseUnclick(e) {
    mouseClick = false;
  }

  function onMouseMove(e) {
    rect = canvas.getBoundingClientRect();
    mouseX = (e.pageX - rect.left) / 2;
    mouseY =
      canvas.height / 2 -
      (((e.pageY - rect.top) / (rect.bottom - rect.top)) * canvas.height) / 2;
  }

  function visualizeScreen() {
    webgl = canvas.getContext("webgl");
    window.onresize = function () {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight - canvas.getBoundingClientRect().top;
      webgl.viewport(0, 0, canvas.width, canvas.height);
      webgl.uniform2f(res, canvas.width, canvas.height);
    };
    window.onresize();
    run = webgl.createProgram();

    var vertex = webgl.createShader(webgl.VERTEX_SHADER);
    webgl.shaderSource(vertex, document.getElementById("v-shader").innerHTML);
    webgl.compileShader(vertex);
    webgl.attachShader(run, vertex);

    var fragment = webgl.createShader(webgl.FRAGMENT_SHADER);
    webgl.shaderSource(fragment, document.getElementById("f-shader").innerHTML);
    webgl.compileShader(fragment);
    webgl.attachShader(run, fragment);
    webgl.linkProgram(run);

    var attrib = webgl.getAttribLocation(run, "atr_pos");
    webgl.enableVertexAttribArray(attrib);
    webgl.bindBuffer(webgl.ARRAY_BUFFER, webgl.createBuffer());
    webgl.vertexAttribPointer(attrib, 2, webgl.FLOAT, false, 8, 0);
    webgl.useProgram(run);
    res = webgl.getUniformLocation(run, "ul_res");
    webgl.uniform2f(res, canvas.width, canvas.height);
  }

  function Vector(x, y) {
    this.x = x;
    this.y = y;
    this.sub = function (vector) {
      return new Vector(vector.x - this.x, vector.y - this.y);
    };

    this.length = function () {
      return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    };

    this.check = function () {
      var len = this.length();
      if (len != 0) {
        this.x /= len;
        this.y /= len;
      }
      return this;
    };
    return this;
  }

  function Emitter() {
    this.reset = function () {
      this.onUpdate = true;
      this.speed = 10;
      this.friction = 0.995;
      this.velocity = [
        (Math.random() * 2.0 - 1.0) * 25,
        (Math.random() * 2.0 - 1.0) * 25,
      ];
      this.pos = [canvas.width / 4, canvas.height / 4];
      this.color = [0, 0, 0, 1];
    };

    this.emit = function () {
      var start = numOfWraps * count;
      var end = start + numOfWraps;
      count++;
      if (count >= wrapGrpCount) {
        count = 0;
      }
      for (var i = start; i < end; i++) {
        container = wrap[i];
        container.reset();
        container.pos[0] = this.pos[0];
        container.pos[1] = this.pos[1];
      }
    };

    this.drag = function (pos) {
      var mVec = new Vector(pos[0], pos[1]);
      var direction = new Vector(this.pos[0], this.pos[1]).sub(mVec).check();
      this.velocity[0] += direction.x;
      this.velocity[1] += direction.y;
    };

    this.move = function () {
      if (mouseClick) this.drag([mouseX, mouseY]);
      this.speed[0] += this.velocity.x * this.movementSpeed;
      this.speed[1] += this.velocity.y * this.movementSpeed;
      this.velocity[0] *= this.friction;
      this.velocity[1] *= this.friction;
      this.pos[0] += this.velocity[0] * this.speed * delta;
      this.pos[1] += this.velocity[1] * this.speed * delta;
      if (this.pos[0] >= canvas.width / 2 || this.pos[0] <= 0)
        this.velocity[0] *= -1;

      if (this.pos[1] >= canvas.height / 2 || this.pos[1] <= 0)
        this.velocity[1] *= -1;

      this.emit();
    };
    this.reset();
  }

  function Wrap() {
    this.reset = function () {
      this.pos = [100, 100];
      this.speed = 50.0;
      this.velocity = [
        (Math.random() * 2.0 - 1.0) / 30,
        (Math.random() * 2.0 - 1.0) / 30,
      ];
      this.acceleration = [
        (Math.random() * 2.0 - 1.0) / 30,
        (Math.random() * 2.0 - 1.0) / 30,
      ];

      this.color = [1, 1, 1, 1];
    };

    this.updateColor = function () {
      this.color[0] = this.color[0] + 0.0;
      this.color[1] = this.color[1] + 0.0;
      this.color[2] = this.color[2] + 0.0;
    };

    this.move = function () {
      this.velocity[0] -= this.acceleration[0];
      this.pos[0] += this.velocity[0] * this.speed * delta;
      this.velocity[1] -= this.acceleration[1];
      this.pos[1] += this.velocity[1] * this.speed * delta;
    };

    this.reset();
  }

  function visualizeWraps() {
    for (var x = 0; x < wrapCount; x++) wrap.push(new Wrap());
  }

  function visualizeEmitters() {
    for (var i = 0; i < emitterCount; i++) emitters.push(new Emitter());
  }

  function animation() {
    prev = curr;
    curr = Date.now();
    delta = (curr - prev) / 2500;
    var container;
    wr = 0;
    var emitter;
    for (var i = 0; i < wrap.length; i++) {
      container = wrap[i];
      stars[wr] = container.pos[0];
      stars[wr + 1] = container.pos[1];
      wr += 2;
      container.move();
      container.updateColor();
    }

    for (var j = 0; j < emitters.length; j++) {
      emitter = emitters[j];
      stars[wr] = emitter.pos[0];
      stars[wr + 1] = emitter.pos[1];
      wr += 2;
      emitter.move();
    }

    webgl.uniform4f(
      webgl.getUniformLocation(run, "ul_color"),
      container.color[0],
      container.color[1],
      container.color[2],
      container.color[3]
    );
    webgl.bufferData(webgl.ARRAY_BUFFER, stars, webgl.STATIC_DRAW);
    webgl.drawArrays(webgl.POINTS, 0, wrap.length + emitters.length);
    window.requestAnimationFrame(animation);
  }

  visualizeScreen();
  visualizeWraps();
  visualizeEmitters();
  animation();
})();
