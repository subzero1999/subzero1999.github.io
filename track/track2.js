

let cdr_const = 0.30;

const total_area = (tl, tw) => tl*tb;

const total_length = (st, cdr, lanes, lane_width, extra) => {
  // st - straight
  // cdr - rdr - 0.03 (for standard) 0.02 for (non standard)
  // lanes - number of lanes
  // lane_width - width of thelane
  // extra - extra space
  return st * 2 * cdr + (lanes * lane_width) + (2 * extra);
}

const total_width = (cdr, lanes, lane_width, extra) => {
  // same as the previous ones
  return (lanes * lane_width) * 2 * cdr + (2 * extra);
}

const find_curve_length = (st) => {
  // st - straight
  // returns the circumference of a single curve
  return (400 - (2 * st))/2
}

const find_rdr = () => {
  // returns the running distance radius of the track
  const circum = 2 * find_curve_length();
  // 2*PI*r = circum
  const rdr = circum / (2 * Math.PI);
  return rdr;
}

const find_cdr = () => find_rdr() - cdr_const;


const click_handler = () => {
  const length = parseInt(document.getElementById("length").value);
  const breadth = parseInt(document.getElementById("breadth").value);

  if (!length>0 && !breadth>0)
    return ;
}

