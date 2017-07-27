// Author - digi0ps

// Track constants in metres
const line_width = 1.22,
  radius_400 = 36.50,
  length_400 = 84.39,
  min_area_400 = 9568.8451,
  stagger_400 = 7.665;

const draw = (cl, cb, l, h, tn) => {
  // cl, cb => canvas length, height
  // l, b => Line length/2, height/2 of track
  // tn => track number 

  const c = document.getElementById("canvas");

  // Calculated lengths
  l = l + ( 9.76 * .5 * tn);
  h = h + ( 9.76 * 1.5 * tn);
  r = h;
  // Dimensions of the lines and the arc which make up the track
  const center = {x:cl/2, y:cb/2};
  const tLine ={l:center.x - l, h:center.y + h};
  const bLine ={l:center.x - l, h:center.y - h};
  const rArc ={l:center.x - l, h:center.y};
  const lArc ={l:center.x + l, h:center.y};

  // Let the drawing begin
  const ctx = c.getContext("2d");
  // ctx.strokeStyle = "white";
  ctx.beginPath();
  ctx.arc(rArc.l, rArc.h, r, 1.5*Math.PI, 0.5*Math.PI, true);
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.rect(tLine.l, tLine.h, l*2, 0.1);
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.arc(lArc.l, lArc.h, r, 1.5*Math.PI, 0.5*Math.PI, false);
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.rect(bLine.l, bLine.h, l*2, 0.1);
  ctx.stroke();
  ctx.closePath();
}

const checkLane = (l, h, tn) => {
  // Check Lane Possbility for 400m tracks
  // By checking the track height and length
  let hh = radius_400 + ( 9.76 * 1.5 * tn);
  hh = hh * 2;
  let ll = (length_400 + ( 9.76 * .5 * tn)) * 2 + hh;
  let res = ( l > ll ) && ( h > hh);
  return res;
}

const draw400 = (l, h) => {
  let width = document.getElementById('canvas').getAttribute('width');
  let height = document.getElementById('canvas').getAttribute('height');
  draw(width, height, length_400, radius_400, 0);
  draw(width, height, length_400, radius_400, 1);
  draw(width, height, length_400, radius_400, 2);
  draw(width, height, length_400, radius_400, 3);
  draw(width, height, length_400, radius_400, 4);
  let lanes = 4;

  if (checkLane(l, h, 5)){
    draw(width, height, length_400, radius_400, 5);
    lanes++;
  }
  if (checkLane(l, h, 6)){
    draw(width, height, length_400, radius_400, 6);
    lanes++;
  }
  if (checkLane(l, h, 7)){
    draw(width, height, length_400, radius_400, 7);
    lanes++;
  }
  if (checkLane(l, h, 8)){
    draw(width, height, length_400, radius_400, 8);
    lanes++;
  }

  const dimText = `Length: ${l}m, Height: ${h}m`;
  const groundText = `Track: 400m, Lanes: ${lanes}`;
  const ctx = document.getElementById('canvas').getContext('2d');
  ctx.fillText(dimText, l/2-55, 15);
  ctx.fillText(groundText, l/2-30, h-10);
}

const clickHandler = () => {
  // Handle the click for the measurements button
  const height = document.getElementById('length').value;
  const width = document.getElementById('breadth').value;

  // Return if values are empty or negative
  if (!height || !width || height<0 || width<0){
    alert('Enter the values properly.');
    return false;
  }

  const canvas = document.getElementById('canvas');
  canvas.setAttribute("width", width);
  canvas.setAttribute("height", height);
  check(width, height);
}

const throwError = () => {
  alert("A track can't be constructed with the given dimensions.");
}

const check = (l, h) => {
  // (w, h) -> length and height of the ground as entered by the user
  let hh = radius_400 + ( 9.76 * 1.5 * 4);
  hh = hh * 2;
  let ll = (length_400 + ( 9.76 * .5 * 4)) * 2 + hh;

  if (l > ll && h > hh){
    draw400(l, h);
    $("#canvasModal").openModal();
    const download = document.getElementById('download');
    download.addEventListener("click", function() {
      const canvas = document.getElementById('canvas');
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      pdf.addImage(imgData, 'PNG', 0, 50);
      //Text
      pdf.setFontType('bold');
      pdf.text(105, 20, "Track Measurement", null, null, 'center');
      pdf.setFontType('normal');
      pdf.text(105, 20, "Approximated diagram of the track using the latest IAAF standards", null, null, 'center');
      pdf.save("track.pdf");
    }, false);
  }
  else
    throwError();
}
