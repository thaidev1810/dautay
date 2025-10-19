// src/GiftPage.tsx
import React, { useEffect } from 'react';
import './GiftPage.css'; // Import CSS cho trang quà
import $ from 'jquery'; // Import jQuery

// Khai báo kiểu cho các biến toàn cục (nếu dùng TypeScript)
declare global {
  interface Window {
    textLetterH2: string;
    textLetterP: string;
    captionImage: string;
  }
}

// Định nghĩa kiểu cho props
interface GiftPageProps {
  onComplete: () => void; // Một hàm được gọi khi người dùng xem xong
}

const GiftPage: React.FC<GiftPageProps> = ({ onComplete }) => {

  useEffect(() => {
    // --- BẮT ĐẦU CODE JS CỦA TRANG 20/10 ---
    
    // Dữ liệu mock (bạn có thể thay đổi)
    window.textLetterH2 = 'Happy Women Day❤️';
    window.textLetterP = 'Gửi đến những chị gái xinh đẹp của em:> Mong chị luôn rạng rỡ, thành công và được yêu thương thật nhiều. Luôn tươi trẻ như hoa 🌸 Mạnh khỏe, hạnh phúc cả nhà đều vui 😄 Và luôn giữ nụ cười thật tươi trên môi nhé! 😊Em luôn ở đây ủng hộ chị💕';
    window.captionImage = 'Món quà đặc biệt dành tặng những người phụ nữ tuyệt vời nhất! 🌹';
    
    const mockData = {
      titleLetter: window.textLetterH2,
      contentLetter: window.textLetterP,
      signatureLetter: 'Với tất cả tình yêu thương ❤️',
      music: '/mucsic/music.mp3', // Đường dẫn trong public
      image: '/flower.png',        // Đường dẫn trong public (đây là ảnh quà chính)
      captionImage: window.captionImage
    };

    // Hàm applyData
    (function applyData(data){
      const title = document.querySelector('#letterScene .textLetter h2');
      const content = document.querySelector('#letterScene .contentLetter');
      const signature = document.querySelector('#letterScene .signature');
      const audio = document.getElementById('bgm') as HTMLAudioElement;
      const overlayImg = document.querySelector('#giftOverlay > img') as HTMLImageElement;
      
      if(title){ title.textContent = ''; }
      if(content){ content.textContent = ''; }
      if(signature && typeof data.signatureLetter === 'string'){ signature.innerHTML = '<br>' + data.signatureLetter; }
      if(audio && typeof data.music === 'string'){ audio.src = data.music; }
      if(overlayImg && typeof data.image === 'string'){ 
        // Cập nhật cả ảnh quà chính VÀ ảnh trong OG tag (nếu có)
        overlayImg.src = data.image; 
        const ogImage = document.querySelector('meta[property="og:image"]');
        if (ogImage) ogImage.setAttribute('content', data.image);
      }
    })(mockData);

    // Bắt đầu chạy UI
    $('#pageLoader').removeClass('show');
    $('body').addClass('is-loaded');


    // Bắt đầu chạy UI - VÀO THẲNG CẢNH THƯ
    // $('#pageLoader').removeClass('show'); // Đã có ở trên
    // $('body').addClass('is-loaded'); // Đã có ở trên
    
    // Hiển thị và khởi tạo cảnh thư ngay lập tức
    const scene = document.getElementById('letterScene');
    if(scene){ 
      scene.style.visibility = 'visible'; // Làm cho nó hiện ra
      scene.style.opacity = '1';          // Fade-in (nhờ CSS transition)
      scene.style.display = 'block';      // Đảm bảo nó được hiển thị
    }
    initLetterScene(); // Khởi chạy hiệu ứng thư (nếu có SVG) và logic thư

    // Phát nhạc ngay lập tức
    var bgm = document.getElementById('bgm') as HTMLAudioElement;
    if(bgm){
      try{ 
        bgm.volume = 0.6; 
        // Cần tương tác người dùng để phát âm thanh trên nhiều trình duyệt
        // Tạm thời comment lại, nhạc sẽ phát khi bấm vào thư
        // bgm.play().catch(function(error){ console.warn("Lỗi tự động phát nhạc:", error) }); 
      } catch(e){
        console.warn("Lỗi xử lý âm thanh:", e);
      }
    }

    // Logic scene thư
    function initLetterScene(){
      try{
        // (Code SVG typing... Rất dài, giữ nguyên)
        const SVG_NS = "http://www.w3.org/2000/svg";
        const shape = document.getElementById('shape');
        const partialPath = document.getElementById('partialPath');
        const theSvg = document.getElementById('theSvg');
        if(!shape || !partialPath || !theSvg){ return; }
        let rid: number | null = null;
        const pathlength = (shape as any).getTotalLength();
        let t = 0;
        let lengthAtT = pathlength * t;
        let d = shape.getAttribute('d') || '';
        let n = (d.match(/C/gi) || []).length;
        let pos = 0;
        class SubPath{
            d: string;
            pointsRy: number[] = [];
            previous: SubPath | null;
            pathLength: number = 0;
            M_point: number[] = [];
            lastCubicBezier: (number[] | undefined)[] | undefined = undefined;
            constructor(sd: string){
              this.d = sd;
              this.getPoints();
              this.previous = subpaths.length > 0 ? subpaths[subpaths.length - 1] : null;
              this.measurePath();
              this.getMovePoint();
              this.getLastCubicBezier();
            }
            getPoints(){
              let temp = this.d.split(/[A-Z,a-z\s,]/).filter(Boolean);
              temp.forEach(item => { this.pointsRy.push(parseFloat(item)); });
            }
            measurePath(){
              let p = document.createElementNS(SVG_NS, 'path');
              p.setAttributeNS(null, 'd', this.d);
              this.pathLength = p.getTotalLength();
            }
            getMovePoint(){
              if(this.previous){
                let p = this.previous.pointsRy; let l = p.length;
                this.M_point = [p[l - 2], p[l - 1]];
              } else {
                let p = this.pointsRy; this.M_point = [p[0], p[1]];
              }
            }
            getLastCubicBezier(){
              let lastIndexOfC = this.d.lastIndexOf('C');
              let temp = this.d.substring(lastIndexOfC + 1).split(/[\s,]/).filter(Boolean);
              let nums: number[] = []; temp.forEach(item => nums.push(parseFloat(item)));
              this.lastCubicBezier = [this.M_point];
              for(let i=0;i<nums.length;i+=2){ this.lastCubicBezier.push(nums.slice(i, i+2)); }
            }
          }
        let subpaths: SubPath[] = [];
        for(let i=0;i<n;i++){
          let newpos = d.indexOf('C', pos + 1);
          if(i>0){ subpaths.push(new SubPath(d.substring(0, newpos))); }
          pos = newpos;
        }
        subpaths.push(new SubPath(d));
        let index = 0;
        for(index = 0; index < subpaths.length; index++){
          if(subpaths[index].pathLength >= lengthAtT){ break; }
        }
        function get_T(tt: number, idx: number){
          lengthAtT = pathlength * tt; let T;
          if(idx > 0 && subpaths[idx]?.previous){
            T = (lengthAtT - subpaths[idx]!.previous!.pathLength) / (subpaths[idx].pathLength - subpaths[idx]!.previous!.pathLength);
          } else { T = lengthAtT / subpaths[idx].pathLength; }
          return T;
        }
        function lerp(A: number[], B: number[], tt: number){ return [ (B[0]-A[0]) * tt + A[0], (B[1]-A[1]) * tt + A[1] ]; }
        function getBezierPoints(tt: number, points: (number[] | undefined)[]){
          let helper: number[][] = [];
          for(let i=1;i<4;i++){ helper.push(lerp(points[i-1]!, points[i]!, tt)); }
          helper.push(lerp(helper[0], helper[1], tt));
          helper.push(lerp(helper[1], helper[2], tt));
          helper.push(lerp(helper[3], helper[4], tt));
          return [points[0], helper[0], helper[3], helper[5]]; // firstBezier
        }
        function drawCBezier(points: (number[] | undefined)[]){
          let dd;
          if(index > 0 && subpaths[index]?.previous){ 
            dd = subpaths[index]!.previous!.d; 
          } else { 
            dd = `M${points[0]![0]},${points[0]![1]} C`; 
          }
          for(let i=1;i<4;i++){ dd += ` ${points[i]![0]},${points[i]![1]} `; }
          partialPath!.setAttributeNS(null, 'd', dd);
        }
        theSvg.style.display = 'inherit';
        function Typing(){
          rid = window.requestAnimationFrame(Typing);
          if(t >= 1){ window.cancelAnimationFrame(rid!); rid = null; }
          else { t += 0.0025; }
          lengthAtT = pathlength * t;
          for(index = 0; index < subpaths.length; index++){
            if(subpaths[index].pathLength >= lengthAtT){ break; }
          }
          if (index === subpaths.length) index = subpaths.length - 1; // Bound check
          
          let T = get_T(t, index);
          let currentSubpath = subpaths[index];
          if(currentSubpath && currentSubpath.lastCubicBezier) {
            let newPoints = getBezierPoints(T, currentSubpath.lastCubicBezier);
            drawCBezier(newPoints);
          }
        }
        rid = window.requestAnimationFrame(Typing);

        // Thư + nhạc (typing)
        let indexText = 0; let textLetter = document.querySelector('#letterScene .textLetter h2');
        let timoutTextLetter: any;
        function textCharLetter(){
          const src = (window.textLetterH2 || '');
          if(indexText < src.length){
            if (textLetter) textLetter.textContent += src[indexText]; indexText++;
            setTimeout(textCharLetter, 100); // Tăng tốc độ gõ
          } else {
            clearInterval(timoutTextLetter);
            setTimeout(()=>{ funcTimeoutLetterContent(); }, 500);
          }
        }
        function funcTimeoutLetter(){
          indexText = 0; if (textLetter) textLetter.textContent = ''; clearInterval(timoutTextLetter);
          textCharLetter(); // Bỏ setInterval
        }
        let indexTextContent = 0; let textLetterContent = document.querySelector('#letterScene .contentLetter');
        let timoutTextLetterContent: any;
        function textCharLetterContent(){
          const src = (window.textLetterP || '');
          if(indexTextContent < src.length){
            if (textLetterContent) textLetterContent.textContent += src[indexTextContent]; indexTextContent++;
            setTimeout(textCharLetterContent, 70); // Tăng tốc độ gõ
          } else { clearInterval(timoutTextLetterContent); }
        }
        function funcTimeoutLetterContent(){
          indexTextContent = 0; if (textLetterContent) textLetterContent.textContent = ''; clearInterval(timoutTextLetterContent);
          textCharLetterContent(); // Bỏ setInterval
        }

        // Hover/mở modal
        $('.valentines').off('mouseenter mouseleave').on('mouseenter', function(){
          $('.card').stop().animate({ top: '-90px' }, 'slow');
        }).on('mouseleave', function(){
          $('.card').stop().animate({ top: 0 }, 'slow');
        });
        $('.card').off('click').on('click', function(){
          $('.wrapperLetterForm').fadeIn();
          if((window.textLetterH2||'') && (window.textLetterP||'')){
            funcTimeoutLetter();
          }
        });
        
        // Ẩn hiện nút mũi tên
        const hasImage = !!(mockData.image || '').trim();
        if(!hasImage){
          $('.letterNextBtn').addClass('is-hidden');
        }else{
          $('.letterNextBtn').removeClass('is-hidden');
        }

        // *** THAY ĐỔI QUAN TRỌNG ***
        // Khi bấm nút mũi tên cuối cùng -> Gọi onComplete ngay
        $('.letterNextBtn').off('click').on('click', function(){
          try{
            $('.wrapperLetterForm').hide(); // Chỉ cần ẩn hộp thư
            onComplete(); // Gọi hàm để chuyển sang MainApp
          }catch(e){
            console.error("Lỗi khi bấm nút tiếp tục:", e);
          }
        });
        
        $('.fa-xmark').off('click').on('click', function(){
          $('.wrapperLetterForm').css('display','none');
          const bgm = document.getElementById('bgm') as HTMLAudioElement;
          if(bgm){ bgm.pause(); bgm.currentTime = 0; }
        });
        
        // (Code Magic dust... giữ nguyên)
        const head = document.getElementsByTagName('head')[0];
        let animationId = 1;
        function CreateMagicDust(x1: number,x2: number,y1: number,y2: number,sizeRatio: number,fallingTime: number,animationDelay: number,node='castle'){
          let dust = document.createElement('span');
          let animation = document.createElement('style');
          animation.innerHTML = `@keyframes blink${animationId}{0%{top:${y1}px;left:${x1}px;width:${2*sizeRatio}px;height:${2*sizeRatio}px;opacity:.4}20%{width:${4*sizeRatio}px;height:${4*sizeRatio}px;opacity:.8}35%{width:${2*sizeRatio}px;height:${2*sizeRatio}px;opacity:.5}55%{width:${3*sizeRatio}px;height:${3*sizeRatio}px;opacity:.7}80%{width:${sizeRatio}px;height:${sizeRatio}px;opacity:.3}100%{top:${y2}px;left:${x2}px;width:0px;height:0px;opacity:.1}}`;
          head.appendChild(animation);
          dust.classList.add('dustDef');
          dust.setAttribute('style', `animation: blink${animationId++} ${fallingTime}s cubic-bezier(.71,.11,.68,.83) infinite ${animationDelay}s`);
          const parent = document.getElementById(node) || document.getElementById('letterScene');
          parent && parent.appendChild(dust);
        }
        [
          [130,132,150,152,.15,2.5,.1,'castle'],
          [65,63,300,299,.5,2,.2,'castle'],
          [70,70,150,150,.45,2,.5],
          [75,78,160,170,.6,2,1],
          [80,82,160,180,.6,1,.4],
          [85,100,160,170,.5,2,.5],
          [125,110,170,180,.25,3,1.5],
          [90,90,115,115,.4,2,2],
          [93,95,200,200,.4,3,1.5],
          [100,100,145,155,.45,1,.5],
          [100,90,170,230,.35,2,.75],
          [100,102,115,112,.35,3,.25],
          [100,95,170,200,.55,1.5,.75],
          [100,97,150,190,.7,2,1.5],
          [105,100,160,180,.5,1.5,.725],
          [125,125,180,190,.25,1,.725],
          [130,130,135,135,.45,3,1.5],
          [135,132,170,190,.25,2.5,.75],
          [135,132,320,315,.2,5,.3,'castle']
        ].forEach((o: any) => {
          CreateMagicDust(o[0], o[1], o[2], o[3], o[4], o[5], o[6], o[7]);
        });
      }catch(err){ console.error("Lỗi initLetterScene:", err); }
    }
    
    // --- HẾT CODE JS CỦA TRANG 20/10 ---

    // Ngăn chặn zoom trên mobile
    const preventZoom = (e: Event) => {
      if (e.type === 'touchmove' && (e as TouchEvent).touches.length > 1) {
        e.preventDefault();
      }
      if (e.type === 'gesturestart') {
        e.preventDefault();
      }
    };
    
    document.addEventListener('touchmove', preventZoom, { passive: false });
    document.addEventListener('gesturestart', preventZoom, { passive: false });

    // Cleanup function
    return () => {
      // Dọn dẹp các event listener khi component bị unmount
      $('.valentines').off('mouseenter mouseleave');
      $('.card').off('click');
      $('.letterNextBtn').off('click');
      $('.fa-xmark').off('click');
      document.removeEventListener('touchmove', preventZoom);
      document.removeEventListener('gesturestart', preventZoom);
    };

  }, [onComplete]); // useEffect chỉ chạy 1 lần

  // Đây là HTML của trang 20/10, chuyển thành JSX
  // (class -> className, style={...}, đóng các thẻ như <img>, <link>)
  // Các đường dẫn ảnh đã được sửa thành /image/... để trỏ vào thư mục /public/image/
  return (
    <div className="gift-page-container">
      {/* anh nen */}
      <img src="/image/bg.png" alt="Ảnh nen" className="background-image" />

      {/* Ảnh ở góc dưới trái */}
      <img src="/image/b3.png" alt="Ảnh b3" className="corner-image bottom-left" />
      <img src="/image/b3.png" alt="Ảnh b3" className="corner-image bottom-left-right" />
      {/* Ảnh ở góc dưới phải */}
      <img src="/image/b4.png" alt="Ảnh b4" className="corner-image-right bottom-right" />
      {/* Annh trai tim */}
      <img src="/image/b6.png" alt="Ảnh b4" className="heart1" />
      <img src="/image/b5.png" alt="Ảnh b5" className="heart2" />
      
      <h1 className="headline">Chúc mừng Ngày Phụ nữ Việt Nam!</h1>

      {/* SCENE PHONG THƯ */}
      <div id="letterScene" style={{ display: 'none' }}>
        <svg id="theSvg" viewBox="-120 -30 240 180" enableBackground="new 0 0 174 148" xmlSpace="preserve">
            <defs>
                <filter id="f" filterUnits="userSpaceOnUse" x="-120" y="-30" width="120%" height="120%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="5" result="blur"></feGaussianBlur>
                    <feOffset in="blur" dx="3" dy="5" result="shadow"></feOffset>
                    <feFlood floodColor="rgba(3,0,0,1)" result="color" />
                    <feComposite in="color" in2="shadow" operator="in" />
                    <feComposite in="SourceGraphic" />
                </filter>
                <path id="shape" d="M0, 21.054 C0, 21.054 24.618, -15.165 60.750, 8.554 C93.249, 29.888 57.749, 96.888 0, 117.388 C-57.749, 96.888  -93.249, 29.888 -60.750, 8.554 C-24.618, -15.165  -0, 21.054 -0, 21.054z" />
                <path id="partialPath" />
            </defs>
            <use id="useThePath" xlinkHref="#partialPath" stroke="white" strokeWidth=".5" strokeOpacity=".5" fill="none" style={{ display: 'none' }} />
        </svg>

        <div id="castle">
            <div className="letter">
                <div className="valentines">
                    <div className="envelope"></div>
                    <div className="front"></div>
                    <div className="card">
                        <div className="text">Happy<br /> Women's<br /> Day!</div>
                        <div className="heart"></div>
                    </div>
                    <div className="hearts">
                        <div className="one"></div>
                        <div className="two"></div>
                        <div className="three"></div>
                        <div className="four"></div>
                        <div className="five"></div>
                    </div>
                </div>
                <div className="shadow"></div>
            </div>
        </div>

        <div className="wrapperLetterForm" style={{ display: 'none' }}>
            <div className="boxLetter">
                <i className="fa-solid fa-xmark"></i>
                <div className="formLetter">
                    <div className="heartLetter">
                        <div className="heartLetterItem"></div>
                    </div>
                    <div className="heartLetter">
                        <div className="heartLetterItem"></div>
                    </div>
                    <div className="wrapperLetter">
                        <div className="giftbox">
                            <div className="img">
                                <img src="/image/giftbox.png" alt="" />
                            </div>
                        </div>
                        <div className="textLetter">
                            <h2></h2>
                            <p className="contentLetter"></p>
                            <div className="heartAnimation">
                                <img src="/image/heartAnimation.gif" alt="" />
                            </div>
                        </div>
                        <div className="mewmew1">
                            <img src="/image/mewmew.gif" alt="" />
                        </div>
                        <div className="mewmew2">
                            <img src="/image/mewmew.gif" alt="" />
                        </div>
                        <div className="signature"></div>
                    </div>
                    <button className="letterNextBtn" title="Tiếp tục" aria-label="Tiếp tục">
                        <i className="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
                <div className="before"></div>
            </div>
        </div>
        <audio id="bgm" src="/mucsic/music.mp3" preload="auto" loop></audio>
      </div>
      
      {/* Lớp phủ hiển thị ảnh quà */}
      <div id="giftOverlay">
        <img src="/flower.png" alt="Quà" /> {/* Đường dẫn public, đây là ảnh quà chính */}
        <img className="anim heartBottom" src="/image/heartAnimation.gif" alt="heart animation" />
        <img className="anim traiTimTop" src="/image/giftraitim.gif" alt="gif trái tim" />
        <div className="caption" id="giftCaption"></div>
      </div>
      
      {/* Loader trang */}
      <div id="pageLoader" className="show">
        <div className="wrap">
            <div className="spinner"></div>
            <div className="text">Đang tải dữ liệu...</div>
        </div>
      </div>
      
      {/* hộp quà */}
      <div className="boxgift" id="giftBox">
        <img src="/image/nap.png" alt="Nắp hộp" className="box-gift lid" />
        <img src="/image/hop.png" alt="Thân hộp" className="box-gift base" />
      </div>
    </div>
  );
};

export default GiftPage;