(function () {
  const segRadius = 5;
  const segDiameter = segRadius * 2;
  const foodRadius = 5;

  const px = (value) => value + 'px';

  const drawView = (view, viewElement) => {
    viewElement.style.top = px(view.top);
    viewElement.style.left = px(view.left);
    viewElement.style.width = px((view.right - view.left));
    viewElement.style.height = px((view.bottom - view.top));
  };

  const drawSegment = (seg, viewElement) => {
    const segElement = document.createElement('div');
    segElement.id = seg.id;
    segElement.className = 'segment';
    segElement.style.top = (seg.y - segRadius);
    segElement.style.left = (seg.x - segRadius);
    viewElement.appendChild(segElement);
  };

  const drawSnake = (snake, viewElement) => {
    snake.getSnake().forEach((seg) => drawSegment(seg, viewElement));
  };

  const drawFood = (food, viewElement) => {
    const foodElement = document.createElement('div');
    foodElement.id = 'food';
    foodElement.className = 'food';
    foodElement.style.top = (food.y - segRadius);
    foodElement.style.left = (food.x - segRadius);
    viewElement.appendChild(foodElement);
  };

  const draw = (snake, food, viewElement) => {
    while (viewElement.firstChild) {
      viewElement.removeChild(viewElement.firstChild);
    }
    drawSnake(snake, viewElement);
    drawFood(food, viewElement);
  };

  const square = (number) => Math.pow(number, 2);

  const distanceBetween = (point1, point2) => {
    const xAxisDist = point1.x - point2.x;
    const yAxisDist = point1.y - point2.y;
    const hypoSquare = square(xAxisDist) + square(yAxisDist);
    return Math.sqrt(hypoSquare);
  };

  const roundToSeg = (n) => {
    const mod = n % segDiameter;
    return n - mod;
  }

  const randomNumber = (start, end) => {
    const difference = end - start;
    const r = Math.floor(Math.random() * difference) + start;
    return roundToSeg(r);
  };

  const segId = (id) => 'seg' + id;

  class Snake {
    #snake;
    #direction;
    #allowedDirections;

    constructor(position) {
      this.#snake = [{ id: 'seg1', ...position }];
      this.#allowedDirections = {
        N: ['N', 'E', 'W'],
        S: ['S', 'E', 'W'],
        E: ['E', 'N', 'S'],
        W: ['W', 'N', 'S']
      };
      this.#direction = 'S';
    }

    getSnake() {
      return this.#snake;
    }

    changeDirection(newDirection) {
      const permittedDirections = this.#allowedDirections[this.#direction];
      if (permittedDirections.includes(newDirection)) {
        this.#direction = newDirection;
      }
    }

    #updateIds() {
      this.#snake.forEach((segment, index) => {
        segment.id = segId(index + 2);
      });
    }

    move() {
      const moves = {
        N: () => head.y -= segDiameter,
        S: () => head.y += segDiameter,
        E: () => head.x += segDiameter,
        W: () => head.x -= segDiameter
      }

      const head = { ...this.#snake[0] };
      const action = moves[this.#direction];
      action();

      this.#updateIds();
      this.#snake.unshift(head);
      this.#snake.pop();
    }

    hasEatenFood(food) {
      const [head] = this.#snake;
      const distance = distanceBetween(head, food);
      return distance < (segRadius + foodRadius);
    }

    isWithinView(view) {
      const { x, y } = this.#snake[0];
      if (y <= (view.top + segRadius) || y >= (view.bottom - segRadius)) {
        return false;
      }
      if (x <= (view.left + segRadius) || x >= (view.right - segRadius)) {
        return false;
      }
      return true;
    };

    increaseLength = () => {
      const length = this.#snake.length;
      const lastSeg = this.#snake[length - 1];
      const tailId = segId(length + 1);
      const tail = {
        id: tailId,
        x: lastSeg.x,
        y: (lastSeg.y - segDiameter)
      };
      this.#snake.push(tail);
    };
  }

  const addFood = (food, view) => {
    food.x = randomNumber((view.top + foodRadius), (view.bottom - foodRadius));
    food.y = randomNumber((view.left + foodRadius), (view.right - foodRadius));
  };

  const onkeydown = (event, snake) => {
    const directions = {
      'ArrowUp': 'N',
      'ArrowDown': 'S',
      'ArrowLeft': 'W',
      'ArrowRight': 'E',
    };

    const code = event.code;
    const direction = directions[code];
    snake.changeDirection(direction);
  };

  const startGame = (view, snake, food) => {
    document.addEventListener('keydown', (event) => onkeydown(event, snake));

    const viewElement = document.getElementById('view');
    drawView(view, viewElement);
    drawSnake(snake, viewElement);

    const intervalId = setInterval(() => {
      if (!snake.isWithinView(view)) {
        clearInterval(intervalId);
        return;
      }
      if (snake.hasEatenFood(food)) {
        snake.increaseLength();
        addFood(food, view);
      }
      snake.move();
      draw(snake, food, viewElement);
    }, 100);
  };

  const view = { top: 0, bottom: 500, left: 0, right: 500 };
  const snake = new Snake({ x: 10, y: 10 });
  const food = { x: 10, y: 20 };
  window.onload = () => startGame(view, snake, food);
})();

