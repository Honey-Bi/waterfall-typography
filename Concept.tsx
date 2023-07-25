import Header from "./Header";

import { useEffect, useRef, useState } from "react";

import '../css/concept.css';

class Ball {
    position: { x: number; y: number; }; // 위치
    velocity: { x: number; y: number; }; // 속도
    e: number; // 충격 속도 감속
    mass: number; // 무게
    radius: number; // 반지름
    color: string; // 색상
    area: number; // 크기
    char: string;
    constructor(
        x:number, y:number, 
        vx: number, vy:number,
        radius:number, 
        e:number, 
        mass:number, 
        color:string,
        char: string
    ){
        this.position = {x: x, y: y};
        this.velocity = {x: vx, y: vy};
        this.e = -e;
        this.mass = mass;
        this.radius = radius;
        this.color = color; 
        this.char = char;
        this.area = (Math.PI * radius * radius) / 10000;
    }
}

// class Wiper {
//     start: { x: number; y: number; }; // 시작 위치
//     end: { x: number; y: number; }; // 종료 위치
//     color: string;
//     constructor(
//         startX:number, startY:number, 
//         endX:number, endY:number, 
//         color:string
//     ) {
//         this.start = {x: startX, y: startY};
//         this.end = {x: endX, y: endY};
//         this.color = color;
//     }
// }
const balls:Array<Ball> = [];

export default function Concept() {
    interface Size {width:number, height:number};
    interface Wiper { radius: number, baseX: number, baseY: number, line_degree: number, endX: number, endY: number };
    const canvasRef =  useRef<HTMLCanvasElement>(null);
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
    const [size, setSize] = useState<Size>({width:0, height:0});
    var fps = 1/60;
    const [degree, setDegree] = useState<number>(-45);
    const [r_direction, setDirection] = useState<boolean>(true);
    const text = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    
    useEffect(() => { //context 처리
        if (canvasRef.current) {
            const canvas:HTMLCanvasElement = canvasRef.current;
            const context = canvas.getContext('2d') as CanvasRenderingContext2D;
            const down = document.getElementById('down') as HTMLElement;
            setCtx(context)
            setSize({width: down.clientWidth, height: down.clientHeight});
            canvas.width = down.clientWidth;
            canvas.height = down.clientHeight;

            
            do {
                var max = 255;
                var min = 20;
                var r = 75 + Math.floor(Math.random() * (max - min) - min);
                var g = 75 + Math.floor(Math.random() * (max - min) - min);
                var b = 75 + Math.floor(Math.random() * (max - min) - min);
                var ch = text[Math.floor(Math.random() * (text.length - 0) - 0)];
                var x = Math.floor(Math.random() * (1226 - 0 + 1) - 0);
                var vx = Math.floor(Math.random() * (10 - -10 + 1) + -10);
                var vy = Math.floor(Math.random() * (10 - 0 + 1) + 0);
                // r = 255; g = 255; b = 255;
                balls.push(new Ball(x, 20, vx, vy, canvas.width*0.02, 0.9, 10, "rgb(" + r + "," + g + "," + b + ")", ch)); 
            } while  (balls.length < 1) 
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
    function animate(ctx: CanvasRenderingContext2D) { // 애니메이션 함수
        var gravity = 0.1;
        var density = 1.22;

        ctx.clearRect(0, 0, size.width, size.height); // 배경 삭제

        var radius = size.height *0.9 //반지름
        const baseX = size.width/2; // 시작위치 X
        const baseY = size.height; // 시작위치 Y
        const line_degree = degree * (Math.PI / 180); // 각도
        const endX = Math.cos(line_degree) * radius + baseX; // 종료위치 X
        const endY = Math.sin(line_degree) * radius + baseY; // 종료위치 Y

        const wiper:Wiper =  {
            radius: radius,
            baseX: baseX,
            baseY: baseY,
            line_degree: line_degree,
            endX: endX,
            endY: endY,
        }

        for(var i = 0; i < balls.length; i++){
            //physics - calculating the aerodynamic forces to drag
            // -0.5 * Cd * A * v^2 * rho
            var fx = -0.5 * density * balls[i].area * balls[i].velocity.x * balls[i].velocity.x * (balls[i].velocity.x / Math.abs(balls[i].velocity.x));
            var fy = -0.5 * density * balls[i].area * balls[i].velocity.y * balls[i].velocity.y * (balls[i].velocity.y / Math.abs(balls[i].velocity.y));

            fx = (isNaN(fx)? 0 : fx);
            fy = (isNaN(fy)? 0 : fy);
            // console.log(fx);
            //Calculating the accleration of the ball
            //F = ma or a = F/m
            var ax = fx / balls[i].mass;
            var ay = (9.81 * gravity) + (fy / balls[i].mass);
            // 9.81

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
            ctx.font = `bold ${balls[i].radius*2}px Consolas`;
            ctx.fillStyle = '#000';
            ctx.fillText(balls[i].char, balls[i].position.x-balls[i].radius/2, balls[i].position.y+balls[i].radius/1.5)
            ctx.closePath();

            // ctx.strokeStyle  = '#777';
            // ctx.lineWidth = 1;
            // // 세로선
            // ctx.beginPath();
            // ctx.moveTo(balls[i].position.x, 0);
            // ctx.lineTo(balls[i].position.x, size.height);
            // ctx.stroke();
            // ctx.closePath();

            // // 가로선
            // ctx.beginPath();
            // ctx.moveTo(0, balls[i].position.y);
            // ctx.lineTo(size.width, balls[i].position.y);
            // ctx.stroke();
            // ctx.closePath();

            
            //Handling the ball collisions
            collisionWall(balls[i], i);	
            collisionWiper(balls[i], wiper, ctx); 
            collisionBall(balls[i]);
        }
        setDegree(-45);
        ctx.lineWidth = 10;
        ctx.lineCap = "round";
        ctx.strokeStyle = "#000";
        ctx.beginPath();
        ctx.moveTo(baseX, baseY);
        ctx.lineTo(endX, endY);
        ctx.closePath();
        ctx.stroke();

        // if (r_direction) {
        //     setDegree(degree + 1);
        // } else {
        //     setDegree(degree - 1);
        // }
        // if (degree === 0) {
        //     setDirection(false);
        // } else if (degree === -180) {
        //     setDirection(true);
        // }
    }

    
    function collisionWiper(ball: Ball, wiper:Wiper, ctx:CanvasRenderingContext2D) {
        ctx.strokeStyle  = '#777';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(wiper.baseX, wiper.baseY);
        ctx.lineTo(ball.position.x, ball.position.y);
        ctx.stroke();
        ctx.closePath();

        var rad = Math.atan2(ball.position.y - wiper.baseY, ball.position.x - wiper.baseX);
        var degree_b = Math.round((rad*180)/Math.PI);
        // console.log(degree_b === degree);
        // console.log();
    }

    function collisionWall(ball: Ball, index: number) {
        if(ball.position.x > size.width - ball.radius){
            // console.log('right');
			ball.velocity.x *= ball.e;
			ball.position.x = size.width - ball.radius;
		}
		if(ball.position.y > size.height - ball.radius){
            // console.log('bottom');
			ball.velocity.y *= ball.e;
			ball.position.y = size.height - ball.radius;
		}
		if(ball.position.x < ball.radius){
            // console.log('left');
			ball.velocity.x *= ball.e;
			ball.position.x = ball.radius;
		}
		if(ball.position.y < ball.radius){
            // console.log('top');
			ball.velocity.y *= ball.e;
			ball.position.y = ball.radius;
		}

        // if(
        //     ball.position.x > size.width + ball.radius || //right
        //     ball.position.y > size.height + ball.radius|| // bottom
        //     ball.position.x < ball.radius // left
        // ){

        //     var x = Math.floor(Math.random() * (size.width - 0 + 1) - 0);
        //     var vx = Math.floor(Math.random() * (10 - -10 + 1) + -10);
        //     var vy = Math.floor(Math.random() * (10 - 0 + 1) + 0);
        //     ball.velocity.x = vx;
        //     ball.velocity.y = vy;
        //     ball.position.x = x;
        //     ball.position.y = 0;
        // }
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

    const click = (e:any) => {
        const e2 = e as MouseEvent;
        console.log(e2.pageX);
        console.log(e2.pageY);

    };
    return (
        <div id="main">
            <Header/>
            <div id="down" onClick={e=> click(e)}>
                {/* <div id="wiper"></div> */}
                <canvas ref={canvasRef} className="fall"> </canvas>
            </div>
        </div>
    )
}
