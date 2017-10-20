"use strict";

// Convert to ES2015 js and minify after this is done
// Author: digi0ps
// Copyright: none
// For: Track Measurement 


// PDF FILE NAME:
var PDFNAME = "track200.pdf";

var p = function p(t) {
  return console.log(t);
};

var cdr_const = 0.20,
    tl = void 0,
    tw = void 0,
    ta = void 0,
    cdr = void 0,
    rdr = void 0,
    lw = void 0,
    straight = void 0,
    extra = void 0;
var rendered = false;
var l = 633,
    h = 544;

var total_area = function total_area(tl, tw) {
  return tl * tw;
};

var total_length = function total_length(st, cdr, lanes, lane_width, extra) {
  // st - straight
  // cdr - rdr - 0.03 (for standard) 0.02 for (non standard)
  // lanes - number of lanes
  // lane_width - width of thelane
  // extra - extra space
  return st + 2 * cdr + lanes * lane_width + 2 * extra;
};

var total_width = function total_width(cdr, lanes, lane_width, extra) {
  // same as the previous ones
  return lanes * lane_width + 2 * cdr + 2 * extra;
};

var find_curve_length = function find_curve_length(st) {
  // st - straight
  // returns the circumference of a single curve
  return (200 - 2 * st) / 2;
};

var find_rdr = function find_rdr(st) {
  // st - length of the straight
  // returns the running distance radius of the track
  var circum = 2 * find_curve_length(st);
  // 2*PI*r = circum
  var rdr = circum / (2 * Math.PI);
  return rdr;
};

var find_cdr = function find_cdr(rdr) {
  return rdr - cdr_const;
};

var click_handler = function click_handler(e) {
  e.preventDefault();
  var length = parseFloat(document.getElementById("length").value); // length of the staght
  var lane_width = parseFloat(document.getElementById("width").value);
  var extra_space = parseInt(document.getElementById("extra").value) || 0;
  cdr_const = $("#nonstan").prop("checked") ? 0.20 : 0.30;

  if (!length > 0 || !lane_width > 0 || length > 90 || lane_width > 90) {
    alert('Enter values properly.');
    return;
  }

  straight = length;
  lw = lane_width;
  rdr = find_rdr(length);
  cdr = find_cdr(rdr);
  extra = extra_space;
  tl = total_length(length, cdr, 8, lane_width, extra_space).toFixed(2);
  tw = total_width(cdr, 8, lane_width, extra_space).toFixed(2);
  ta = total_area(tl, tw).toFixed(2);
  // Make sures staggers don't rerender
  rendered = false;
  $("#tl").text(tl + "m");
  $("#tw").text(tw + "m");
  $("#ta").html(ta + "m<sup>2</sup>");
  $(".res").fadeIn(400);
  $("html, body").animate({
    scrollTop: $("#tracklink").offset().top
  }, 200);
};

var renderCanvas = function renderCanvas() {
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');
  track_image = new Image();
  track_image.src = "track400.jpg";
  track_image.onload = function () {
    ctx.drawImage(track_image, 0, 0);
  };
  var dimText = "Total Length: " + tl + "m, Total Width: " + tw + "m";
  var groundText = "Track: 400m, Lanes: " + 8;
  ctx.fillText(dimText, l / 2 - 110, h - 30);
  ctx.fillText(groundText, l / 2 - 70, h - 10);
};

var renderStaggersTable = function renderStaggersTable() {
  // lw - lane width
  // formula - [lw(n-1) - 0.10]*2PI
  if (rendered) return;
  var full_staggers = [0],
      diagonal_excess = [];
  for (var n = 2; n <= 8; n++) {
    full_staggers.push(((lw * (n - 1) - 0.10) * 2 * Math.PI).toFixed(2));
  };
  for (var _n = 1; _n <= 8; _n++) {
    var _l = total_length(length, cdr, _n, lw, extra).toFixed(2) / 2;
    var w = lw * _n;
    var de = Math.sqrt(_l * _l + w * w);
    de = de - _l;
    diagonal_excess.push(de.toFixed(2));
  }
  var stats = "\n    <div class='col s12 m8 push-m2'>\n    <table class='table' align='center' id='stats-table'>\n    <thead>\n    <th>Length of the straight</th>\n    <th>Lane Width</th>\n    <th>RDR</th>\n    <th>CDR</th>\n    </thead>\n    <tr>\n    <td>" + straight + "</td>\n    <td>" + lw + "</p>\n    <td>" + rdr.toFixed(2) + "</td>\n    <td>" + cdr.toFixed(2) + "</td>\n    </tr>\n    </table>\n    </div>\n  ";
  $("#trackstats").append(stats);
  for (var i = 0; i < 8; i++) {
    var onehalf = (full_staggers[i] * 1.5).toFixed(2);
    onehalf = parseFloat(onehalf);
    var halfde = full_staggers[i] * 0.5 + parseFloat(diagonal_excess[i]);
    var onehalfde = onehalf + parseFloat(diagonal_excess[i]);
    halfde = halfde.toFixed(2);
    onehalfde = onehalfde.toFixed(2);
    var ele = "\n    <tr>\n      <td class=\"center\">" + (i + 1) + "</td>\n      <td class=\"center\">" + full_staggers[i] + "</td>\n      <td class=\"center\">" + full_staggers[i] * 0.5 + "</td>\n      <td class=\"center\">" + diagonal_excess[i] + "</td>\n      <td class=\"center\">" + halfde + "</td>\n      <td class=\"center\">" + onehalf + "</td>\n      <td class=\"center\">" + onehalfde + "</td>\n    </tr>\n    ";
    $("#staggers").append(ele);
  }
  $("#staggers").addClass("centered");
  rendered = true;
};

var generatePDF = function generatePDF(e) {
  e.preventDefault();
  var pdf = new jsPDF();
  //Text
  pdf.setFontType('bold');
  pdf.text(105, 20, "Track Measurement", null, null, 'center');
  pdf.setFontType('normal');
  pdf.text(105, 30, "Approximated diagram of the track using the latest IAAF standards", null, null, 'center');

  var pdfwidth = pdf.internal.pageSize.width;
  var pdfheight = pdf.internal.pageSize.height / 2 - 20;
  pdf.addImage(dataURL, 'PNG', 0, 40, pdfwidth, pdfheight);
  pdf.text(105, 170, "Total Area: " + ta, null, null, 'center');
  pdf.text(105, 180, "Total Length: " + tl, null, null, 'center');
  pdf.text(105, 190, "Total Width: " + tw, null, null, 'center');
  pdf.text(105, 200, "Running Distance Radius: " + rdr.toFixed(2), null, null, 'center');
  pdf.text(105, 210, "Curved Distance Radius: " + cdr.toFixed(2), null, null, 'center');
  var stats = document.getElementById('stats-table');
  var table1 = pdf.autoTableHtmlToJson(stats);
  var staggers = document.getElementById("staggers");
  var table2 = pdf.autoTableHtmlToJson(staggers);
  pdf.autoTable(table1.columns, table1.data, { startY: 215 });
  pdf.autoTable(table2.columns, table2.data, { startY: 245 });

  // window.open(pdf.output('datauristring'))
  pdf.save(PDFNAME);
};

var dataURL = void 0;
// Add track image 
var img = new Image();
img.src = 'track200.jpg';
img.setAttribute('crossOrigin', 'anonymous');
img.addEventListener('load', function () {
  var canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  var context = canvas.getContext('2d');
  context.drawImage(img, 0, 0);
  dataURL = canvas.toDataURL();
});

$("#calculate").on("click", click_handler);

$("#tracklink").on("click", function (e) {
  e.preventDefault();
  renderStaggersTable();
  $("#input").fadeOut(250, function () {
    $("#track").fadeIn(1000);
  });
  $("html, body").animate({
    scrollTop: 100
  }, 200);
});

$("#measurelink").on("click", function (e) {
  e.preventDefault();
  $("#track").fadeOut(250, function () {
    $("#input").fadeIn(1000);
  });
});

$("#downloadlink").on("click", generatePDF);
