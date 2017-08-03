// Convert to ES2015 js and minify after this is done

// Author digi0ps

const p = (t) => console.log(t);

let cdr_const = 0.30, tl, td, ta, cdr, rdr, lw, straight;
let rendered = false;
const l = 633, h = 544;

const total_area = (tl, tw) => tl*tw;

const total_length = (st, cdr, lanes, lane_width, extra) => {
  // st - straight
  // cdr - rdr - 0.03 (for standard) 0.02 for (non standard)
  // lanes - number of lanes
  // lane_width - width of thelane
  // extra - extra space
  return st + (2 * cdr) + (lanes * lane_width) + (2 * extra);
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

const renderStaggers = () => {
  // lw - lane width
  // formula - [lw(n-1) - 0.10]*2PI
  if (rendered)
    return;
  let full_staggers = [0], half_staggers =[0];
  for(n=2;n<=8;n++){
    full_staggers.push(((lw*(n-1) - 0.10)*2*Math.PI).toFixed(2));
    half_staggers.push(((lw*(n-1) - 0.10)*Math.PI).toFixed(2));
  };
  const stats = `
    <p>Length of the straight: ${straight}</p>
    <p>Lane width: ${lw}</p>
    <p>RDR (Running Distance Radius): ${rdr.toFixed(2)}</p>
    <p>CDR (Curved Distance Radius): ${cdr.toFixed(2)}</p>
  `;
  $("#trackstats").append(stats);
  for(i=0;i<8;i++){
    let ele = `
    <tr>
      <td class="center">${i+1}</td>
      <td class="center">${full_staggers[i]}</td>
      <td class="center">${half_staggers[i]}</td>
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
  let dataURL;
  // Add track image 
  const img = new Image();
  img.setAttribute('crossOrigin', 'anonymous');
  img.src = 'track400.jpg';
  img.addEventListener('load',()=>{
    const canvas = document.getElementById('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const context = canvas.getContext('2d');
    context.drawImage(img, 0, 0);
    dataURL = canvas.toDataURL();
  });
  //Text
    pdf.addImage(dataURL, 'PNG', 0, 80);

  pdf.setFontType('bold');
  pdf.text(105, 20, "Track Measurement", null, null, 'center');
  pdf.setFontType('normal');
  pdf.text(105, 30, "Approximated diagram of the track using the latest IAAF standards", null, null, 'center');
  pdf.text(105, 50, `Total Area: ${ta}`, null, null, 'center');
  pdf.text(105, 60, `Total Length: ${tl}`, null, null, 'center');
  pdf.text(105, 70, `Total Width: ${tw}`, null, null, 'center');
  pdf.text(105, 80, `Running Distance Radius: ${rdr}`, null, null, 'center');
  pdf.text(105, 90, `Curved Distance Radius: ${cdr}`, null, null, 'center');
  pdf.save("track.pdf");
}

$("#calculate").on("click", click_handler);

$("#tracklink").on("click", (e) => {
  e.preventDefault();
  renderStaggers();
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
/*
renderCanvas();
calcStaggers(1.22);
*/
