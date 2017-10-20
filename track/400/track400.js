// Convert to ES2015 js and minify after this is done
// Author: digi0ps
// Copyright: none
// For: Track Measurement 

//PDF FILE NAME
const PDFNAME = "track400.pdf";

const p = (t) => console.log(t);

let cdr_const = 0.30, tl, tw, ta, cdr, rdr, lw, straight, extra;
let rendered = false;
const l = 633, h = 544;

const total_area = (tl, tw) => tl*tw;

const total_length = (st, cdr, lanes, lane_width, extra) => {
  // st - straight
  // cdr - rdr - 0.03 (for standard) 0.02 for (non standard)
  // lanes - number of lanes
  // lane_width - width of thelane
  // extra - extra space
  return st + (2 * cdr) + (2 * (lanes * lane_width)) + (2 * extra);
}

const total_width = (cdr, lanes, lane_width, extra) => {
  // same as the previous ones
  return (lanes * lane_width) + (2 * cdr) + (2 * extra);
}

const find_curve_length = (st) => {
  // st - straight
  // returns the circumference of a single curve
  return (400 - (2 * st))/2
}

const find_rdr = (st) => {
  // st - length of the straight
  // returns the running distance radius of the track
  const circum = 2 * find_curve_length(st);
  // 2*PI*r = circum
  const rdr = circum / (2 * Math.PI);
  return rdr;
}

const find_cdr = (rdr) => rdr - cdr_const;


const click_handler = (e) => {
  e.preventDefault();
  const length = parseFloat(document.getElementById("length").value); // length of the staght
  const lane_width = parseFloat(document.getElementById("width").value);
  const extra_space = parseInt(document.getElementById("extra").value) || 0;
  cdr_const = $("#nonstan").prop("checked")?0.20:0.30;


  if (!length>0 || !lane_width>0 || length>90 || lane_width>90){
    alert('Enter values properly.');
    return ;
  }

  straight = length;
  lw = lane_width;
  extra = extra_space;
  rdr = find_rdr(length);
  cdr = find_cdr(rdr);
  tl = total_length(length, cdr, 8, lane_width, extra_space).toFixed(2);
  tw = total_width(cdr, 8, lane_width, extra_space).toFixed(2);
  ta = total_area(tl, tw).toFixed(2);
  // Make sures staggers don't rerender
  rendered = false;
  $("#tl").text(tl+"m");
  $("#tw").text(tw+"m");
  $("#ta").html(ta+"m<sup>2</sup>");
  $(".res").fadeIn(400);
  $("html, body").animate({
    scrollTop: $("#tracklink").offset().top
  }, 200);
}

const renderCanvas = () => {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  track_image = new Image();
  track_image.src = "track400.jpg";
  track_image.onload = () => {
    ctx.drawImage(track_image, 0, 0);
  }
  const dimText = `Total Length: ${tl}m, Total Width: ${tw}m`;
  const groundText = `Track: 400m, Lanes: ${8}`;
  ctx.fillText(dimText, l/2-110, h-30);
  ctx.fillText(groundText, l/2-70, h-10);
}

const renderLaneTable = () => {
  // render lane table for every lane and display it on the sitefs
}

const renderStaggerTable = () => {
  // lw - lane width
  // formula - [lw(n-1) - 0.10]*2PI
  if (rendered)
    return;
  let full_staggers = [0], diagonal_excess = [];
  for(let n=2;n<=8;n++){
    let full_stag = ((lw*(n-1) - 0.10)*2*Math.PI).toFixed(2);
    full_staggers.push(full_stag);
  };
  for(let n=1;n<=8;n++){
    let l = total_length(length, cdr, n, lw, extra).toFixed(2)/2;
    let w = lw * n;
    let de = Math.sqrt(l*l + w*w);
    de = de - l;
    diagonal_excess.push(de.toFixed(2));
  }

  const stats = `
    <div class='col s12 m8 push-m2'>
    <table class='table' align='center' id='stats-table'>
    <thead>
    <th>Length of the straight</th>
    <th>Lane Width</th>
    <th>RDR</th>
    <th>CDR</th>
    </thead>
    <tr>
    <td>${straight}</td>
    <td>${lw}</p>
    <td>${rdr.toFixed(2)}</td>
    <td>${cdr.toFixed(2)}</td>
    </tr>
    </table>
    </div>
  `;
  $("#trackstats").append(stats);
  for(let i=0;i<8;i++){
    let onehalf = (full_staggers[i]*1.5).toFixed(2);
    onehalf = parseFloat(onehalf);
    let halfde = full_staggers[i]*0.5 + parseFloat(diagonal_excess[i]);
    let onehalfde = onehalf + parseFloat(diagonal_excess[i]);
    halfde = halfde.toFixed(2);
    onehalfde = onehalfde.toFixed(2);
    let ele = `
    <tr>
      <td class="center">${i+1}</td>
      <td class="center">${full_staggers[i]}</td>
      <td class="center">${full_staggers[i]*0.5}</td>
      <td class="center">${diagonal_excess[i]}</td>
      <td class="center">${halfde}</td>
      <td class="center">${onehalf}</td>
      <td class="center">${onehalfde}</td>
    </tr>
    `;
    $("#staggers").append(ele);
  }
  $("#staggers").addClass("centered");
  rendered = true;
}

const generatePDF = (e) => {
  e.preventDefault();
  const pdf = new jsPDF();
  //Text
  pdf.setFontType('bold');
  pdf.text(105, 20, "Track Measurement", null, null, 'center');
  pdf.setFontType('normal');
  pdf.text(105, 30, "Approximated diagram of the track using the latest IAAF standards", null, null, 'center');

  let pdfwidth = pdf.internal.pageSize.width;    
  let pdfheight = pdf.internal.pageSize.height/2 - 20;
  pdf.addImage(dataURL, 'PNG', 0, 40, pdfwidth, pdfheight);
  pdf.text(105, 170, `Total Area: ${ta}`, null, null, 'center');
  pdf.text(105, 180, `Total Length: ${tl}`, null, null, 'center');
  pdf.text(105, 190, `Total Width: ${tw}`, null, null, 'center');
  pdf.text(105, 200, `Running Distance Radius: ${rdr.toFixed(2)}`, null, null, 'center');
  pdf.text(105, 210, `Curved Distance Radius: ${cdr.toFixed(2)}`, null, null, 'center');
  var stats = document.getElementById('stats-table');
  var table1 = pdf.autoTableHtmlToJson(stats);
  var staggers = document.getElementById("staggers");
  var table2 = pdf.autoTableHtmlToJson(staggers);
  pdf.autoTable(table1.columns, table1.data, {startY: 215});
  pdf.autoTable(table2.columns, table2.data, {startY: 245});

  // window.open(pdf.output('datauristring'));
  pdf.save(PDFNAME);
}

let dataURL;
// Add track image 
var img = new Image();
img.src = 'track400.jpg';
img.setAttribute('crossOrigin', 'anonymous');
img.addEventListener('load',()=>{
  var canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  var context = canvas.getContext('2d');
  context.drawImage(img, 0, 0);
  dataURL = canvas.toDataURL();
});

$("#calculate").on("click", click_handler);

$("#tracklink").on("click", (e) => {
  e.preventDefault();
  renderStaggerTable();
  $("#input").fadeOut(250, () => {
    $("#track").fadeIn(1000);
  });
  $("html, body").animate({
    scrollTop: 100
  }, 200);
});

$("#measurelink").on("click", (e) => {
  e.preventDefault();
  $("#track").fadeOut(250, () => {
    $("#input").fadeIn(1000);
  });
});

$("#downloadlink").on("click", generatePDF);
