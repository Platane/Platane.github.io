(function( a ){
a = a || document.getElementsByTagName('canvas')[0];
var b = document.body;
var d = function(e){ return function(){ e.parentNode.removeChild(e); }; }(a);
// unprefix some popular vendor prefixed things (but stick to their original name)
var AudioContext =
  window.AudioContext ||
  window.webkitAudioContext;
var requestAnimationFrame =
  window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  function(f){ setTimeout(f, 1000/30); };
// stretch canvas to screen size (once, wont onresize!)
a.style.width = (a.width = innerWidth) + 'px';
a.style.height = (a.height = innerHeight) + 'px';

var c = a.getContext('2d');
		



for(p=6.2832,m=Math,e=[],r=m.random,S=m.sin,f=m.floor,t=D=E=A=T=H=300,g="beginPath",h="quadraticCurveTo",l="stroke",n="Style",q="lineTo",u="moveTo",x="fill",o="translate",a.onmousemove=function(c){T=c.pageX,H=c.pageY},i=180;i--;)k=r()-.5,k*k>.014&&e.push([200*k,-k*k*150+9,r()-.5,r()])
!function a(){for(A-=m.min(.02,m.max(-.02,.2*((A+m.atan2(D-T,E-H))%p-.5*p))),D-=2*S(A),E+=2*S(A+p/4),c.clearRect(0,0,9999,9999),c.save(),c[o](-D,-E),i=392;i--;)c[g](),c.rect(149*(i%28-1),149*(f(i/28)-1),150,150),k=4+(i^7+2*i)%5,c[x+n]="#"+k+k+k,c[x]()
for(c[o](2*D,2*E),c.rotate(A),c.lineCap="round",c.lineWidth=8,c[l+n]="#532",c[g](),c[u](-100,-30),c[h](-60,10,-5,0),c[q](5,0),c[h](60,10,100,-30),c[l](),k=t++/20%p,c[g](),c[u](0,15),c[q](0,0),c[h](20*S(k+p/4),-45,30*S(k),-80+S(2*k)),c[l](),i=e.length;i--;)k=e[i],j=(k[3]+t/80)%1,c[g](),c.arc(k[0]+50*k[2]*(j+j*j),k[1]-50*(j+j*j),.6>j?40*j:36-20*j,0,p),c[x+n]="rgba("+f(240-50*j)+","+f(230-120*j)+","+f(180-180*j)+","+(.8-j*j*.8)+")",c[x]()
c.restore(),requestAnimationFrame(a)}()





})( document.getElementById('1kdragon') );