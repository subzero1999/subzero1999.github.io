const p = (t) => console.log(t);

let cdr_const = 0.30;

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
  return (lanes * lane_width) * (2 * cdr) + (2 * extra);
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
  p(extra_space);
  // get the type of the field using radio buttons


  if (!length>0 && !lane_width>0 || length>90 && lane_width>90)
    return ;

  const rdr = find_rdr(length);
  const cdr = find_cdr(rdr);
  const tl = total_length(length, cdr, 8, lane_width, extra_space).toFixed(2);
  const tw = total_width(cdr, 8, lane_width, extra_space).toFixed(2);
  const ta = total_area(tl, tw).toFixed(2);
  $("#tl").text(tl+"m");
  $("#tw").text(tw+"m");
  $("#ta").html(ta+"m<sup>2</sup>");
  $(".results").fadeIn(200);
}

$("#calculate").on("click", click_handler);

