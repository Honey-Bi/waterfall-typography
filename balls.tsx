import { useEffect, useRef, useState } from "react";

class Ball {
    position: { x: number; y: number; };
    velocity: { x: number; y: number; };
    e: number;
    mass: number;
    radius: number;
    color: string;
    area: number;

    constructor(x:number, y:number, radius:number, e:number, mass:number, color:string){
        this.position = {x: x, y: y}; //m
        this.velocity = {x: 0, y: 0}; // m/s
        this.e = -e; // has no units
        this.mass = mass; //kg
        this.radius = radius; //m
        this.color = color; 
        this.area = (Math.PI * radius * radius) / 10000; //m^2
    }
}
const balls:Array<Ball> = [];

export default function Test2() {
    interface Size {width:number, height:number};
    const canvasRef =  useRef<HTMLCanvasElement>(null);
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
    const [size, setSize] = useState<Size>({width:0, height:0});
    var fps = 1/60;

    useEffect(() => { //context 처리
        if (canvasRef.current) {
            const canvas:HTMLCanvasElement = canvasRef.current;
            const context = canvas.getContext('2d') as CanvasRenderingContext2D;
            setCtx(context)
            setSize({width:document.body.clientWidth, height: document.body.clientHeight});
            canvas.width = document.body.clientWidth;
            canvas.height = document.body.clientHeight;

            for(var i = 0; i < 200; i++) {
                var max = 255;
                var min = 20;
                var r = 75 + Math.floor(Math.random() * (max - min) - min);
                var g = 75 + Math.floor(Math.random() * (max - min) - min);
                var b = 75 + Math.floor(Math.random() * (max - min) - min);
                balls.push(new Ball(0, 0, 10, 0.7,10, "rgb(" + r + "," + g + "," + b + ")")); 
            }
            console.log(balls);
        }
    }, [canvasRef]);

    useEffect(() => { // 애니메이션 
		let requestId: number;
		const RequestAnimation = (ctx: CanvasRenderingContext2D | null) => () => {
			if (ctx) {
                animate(ctx);
            }
			// 애니메이션 콜백 반복
			requestId = window.requestAnimationFrame(RequestAnimation(ctx));
		};
        
		// 애니메이션 초기화
		requestId = window.requestAnimationFrame(RequestAnimation(ctx));
		return () => {
            window.cancelAnimationFrame(requestId);
		};
    });

    function animate(ctx: CanvasRenderingContext2D) { //애니메이션 함수
        var gravity = 0.1;
        var density = 1.22;
        var drag = 0.47;

        ctx.clearRect(0, 0, size.width, size.height);

        for(var i = 0; i < balls.length; i++){
            //physics - calculating the aerodynamic forces to drag
            // -0.5 * Cd * A * v^2 * rho
            var fx = -0.5 * drag * density * balls[i].area * balls[i].velocity.x * balls[i].velocity.x * (balls[i].velocity.x / Math.abs(balls[i].velocity.x));
            var fy = -0.5 * drag * density * balls[i].area * balls[i].velocity.y * balls[i].velocity.y * (balls[i].velocity.y / Math.abs(balls[i].velocity.y));

            fx = (isNaN(fx)? 0 : fx);
            fy = (isNaN(fy)? 0 : fy);
            // console.log(fx);
            //Calculating the accleration of the ball
            //F = ma or a = F/m
            var ax = fx / balls[i].mass;
            var ay = (9.81 * gravity) + (fy / balls[i].mass);

            //Calculating the ball velocity 
            balls[i].velocity.x += ax * fps;
            balls[i].velocity.y += ay * fps;

            //Calculating the position of the ball
            balls[i].position.x += balls[i].velocity.x * fps * 100;
            balls[i].position.y += balls[i].velocity.y * fps * 100;
            
            //공 그리기
            ctx.beginPath();
            ctx.fillStyle = balls[i].color;
            ctx.arc(balls[i].position.x, balls[i].position.y, balls[i].radius, 0, 2 * Math.PI, true);
            ctx.fill();
            ctx.closePath();
    
            // if(mouse.isDown){
            //     ctx.beginPath();
            //     ctx.strokeStyle = "rgb(0,255,0)";
            //     ctx.moveTo(balls[balls.length - 1].position.x, balls[balls.length - 1].position.y);
            //     ctx.lineTo(mouse.x, mouse.y);
            //     ctx.stroke();
            //     ctx.closePath();
            // }
            //Handling the ball collisions
            collisionWall(balls[i]);	
            collisionBall(balls[i]);
        }
    }

    function collisionWall(ball:Ball){ //
        if(ball.position.x > size.width - ball.radius){ // left wall
            ball.velocity.x *= ball.e;
            ball.position.x = size.width - ball.radius;
        }
        // if(ball.position.y > size.height - ball.radius){
        // 	ball.velocity.y *= ball.e;
        // 	ball.position.y = size.height - ball.radius;
        // }
        if(ball.position.x < ball.radius){ // right wall
            ball.velocity.x *= ball.e;
            ball.position.x = ball.radius;
        }
        if(ball.position.y < ball.radius || ball.position.y > size.height + ball.radius){ // 바닥 무한
            ball.velocity.y *= ball.e;
            ball.position.y = ball.radius;
        }
    }
    function collisionBall(b1:Ball){
        for(var i = 0; i < balls.length; i++){
            var b2 = balls[i];
            if(b1.position.x !== b2.position.x && b1.position.y !== b2.position.y){
                //quick check for potential collisions using AABBs
                if(b1.position.x + b1.radius + b2.radius > b2.position.x
                    && b1.position.x < b2.position.x + b1.radius + b2.radius
                    && b1.position.y + b1.radius + b2.radius > b2.position.y
                    && b1.position.y < b2.position.y + b1.radius + b2.radius){
                    
                    //pythagoras 
                    var distX = b1.position.x - b2.position.x;
                    var distY = b1.position.y - b2.position.y;
                    var d = Math.sqrt((distX) * (distX) + (distY) * (distY));
        
                    //checking circle vs circle collision 
                    if(d < b1.radius + b2.radius){
                        var nx = (b2.position.x - b1.position.x) / d;
                        var ny = (b2.position.y - b1.position.y) / d;
                        var p = 2 * (b1.velocity.x * nx + b1.velocity.y * ny - b2.velocity.x * nx - b2.velocity.y * ny) / (b1.mass + b2.mass);
    
                        // calulating the point of collision 
                        var colPointX = ((b1.position.x * b2.radius) + (b2.position.x * b1.radius)) / (b1.radius + b2.radius);
                        var colPointY = ((b1.position.y * b2.radius) + (b2.position.y * b1.radius)) / (b1.radius + b2.radius);
                        
                        //stoping overlap 
                        b1.position.x = colPointX + b1.radius * (b1.position.x - b2.position.x) / d;
                        b1.position.y = colPointY + b1.radius * (b1.position.y - b2.position.y) / d;
                        b2.position.x = colPointX + b2.radius * (b2.position.x - b1.position.x) / d;
                        b2.position.y = colPointY + b2.radius * (b2.position.y - b1.position.y) / d;
    
                        //updating velocity to reflect collision 
                        b1.velocity.x -= p * b1.mass * nx;
                        b1.velocity.y -= p * b1.mass * ny;
                        b2.velocity.x += p * b2.mass * nx;
                        b2.velocity.y += p * b2.mass * ny;
                    }
                }
            }
        }
    }

    return(
        <div id="t1" style={{
            height: '100vh'
        }}>
            <canvas ref={canvasRef}></canvas>
        </div>
    )
}
