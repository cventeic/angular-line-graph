import { Component, OnInit } from '@angular/core';
import { SimpleChanges } from '@angular/core';
import { ElementRef } from '@angular/core';
import { ViewChild } from '@angular/core';
import { AfterViewInit } from '@angular/core';

import * as _ from 'underscore';
import * as d3 from 'd3';


interface IRun {
    x: number;
    y: number;
}

interface IDataSeries {
  id: number;
  color;
  show: boolean;

  data: IRun[];
}


@Component({
  selector: 'app-line-graph',
  templateUrl: './line-graph.component.html',
  styleUrls: ['./line-graph.component.css']
})
export class LineGraphComponent implements OnInit, AfterViewInit {

  @ViewChild('svg_ref') template_as_child;
  title:string;

  width: number;
  height: number;
  boxes;
  scales;
  titles;
  zoomer;
  el;

  changeLog: string[] = [];

  series_set: IDataSeries[] = [ {id:0, color: {r:0, g:255, b:0}, show: true, 
    data:[
      {x: 0, y: 0}, 
      {x: 1, y: 1}, 
      {x: 2, y: 2}, 
      {x: 3, y: 3} 
    ]
  } ];

  constructor(el_l: ElementRef) {
    this.el = el_l;
    this.zoomer = d3.zoom()
  }

  // Return the median value in an array
  public get_median_value(values){

    values.sort(function(a,b){
      return (a - b);
    });

    let half = Math.floor(values.length/2);

    if(values.length % 2)
      return values[half]
    else
      return (values[half-1] + values[half]) / 2.0
  }

  public dump_points(points){

    let point_array = points.map(function(point){
      return [point.x, point.y];
    })

    let txt = "  dump_points: " + point_array
    return txt;
  }

  // Combine all points at the same x value into a single point
  //   with y value that is the median of the y values of all points
  public get_x_median_y_points(points){

    // points are an array of form [{x:0,y:0},{x:1,y:2}]

    // console.log("get_x_medain_y_points: points = " + points);

    // points.forEach(function(point){
    //  console.log("point: " + point);
    //  console.log("point x,y: " + point.x + ', ' + point.y);
    //})

    // Were going to examine a column of data at every value of x
    let y_values_at_x= {} 

    // Start with empty array of y values for each x value
    points.forEach(function(point){ y_values_at_x[point.x] = []} )

    // Store all y values found for a particular x value
    points.forEach(function(point){ y_values_at_x[point.x].push(point.y)} )

    let x_values = Object.keys(y_values_at_x)

    let x_median_y_points = x_values.map(function(x_val){
      // console.log("y_values_at_x x_val" + x_val);

      let y_values = y_values_at_x[x_val];

      let median_y_value_at_x =  this.get_median_value(y_values);

      //console.log("y_values_at_x: x_val, median_y_value_at_x, y_values, " + x_val + ', ' + median_y_value_at_x + ', ' + y_values);

      let x_median_y_point = {x: x_val, y: median_y_value_at_x}

      return x_median_y_point;
    }, this)

    //console.log("x_median_y_points = " + x_median_y_points);

    //x_median_y_points.forEach(function(point){ console.log("x_median_y_points: x,y: " + point.x + ', ' + point.y); })
    //

    return x_median_y_points
  }

  // Create an svg style point string from array of points
  //  points are an array of form [{x:0,y:0},{x:1,y:2}]
  //  scale the points prior to generating the string
  public make_svg_point_string(points, scales) {

    if(scales == null) return "";

    let point_xfrm = d3.line()
      .x(function(d){ return scales.x(d.x); })
      .y(function(d){ return scales.y(d.y); })
    
    let svg_points_string = point_xfrm(points);

    return svg_points_string;
  }

  // Find the median y value for all points at each x value 
  //
  // Create an svg style point string from array of points
  public make_svg_median_point_string(points, scales) {

    let x_median_y_points = this.get_x_median_y_points(points);

    return this.make_svg_point_string(x_median_y_points, scales)
  }


  public compute_size(width, height){
    //console.log "compute_size.enter"

    // chris hack
    height = width * 0.75

    // Margins are the space inside the box for axis tick labels
    let margin =  { top: 60, right: 60, bottom: 60, left: 100 }
    
    let boxes = {
      margin: margin,
      internal: {
        width:  width  - margin.left - margin.right,
        height: height - margin.top  - margin.bottom
      },
      external: {
        width:  width,
        height: width * 0.75 
      }
    }

    // console.log boxes 
    // console.log "compute_size.exit"
    return boxes;
  }

  public compute_data_extent(points) {
    //console.log("compute_data_extent");

    let x_values = points.map(function(point){return point.x;})
    let y_values = points.map(function(point){return point.y;})

    let data_extents = {
      x: d3.extent(x_values),
      y: d3.extent(y_values)
    }

    return data_extents
  }

  public compute_data_extents_all_series(series_array) {
    //console.log("compute_data_extents_all_series enter =" + series_array);

    series_array.forEach(function(series){
      let data = series.data
      let point_string = this.dump_points(data);
    },this)

    let mythis = this;

    let series_data_extent = series_array.reduce(function(acc, series){

      let series_data_extents = mythis.compute_data_extent(series.data)

      let x_array = acc.x.concat(series_data_extents.x)
      let y_array = acc.y.concat(series_data_extents.y)

      let acc_data_extents = {
        x: d3.extent(x_array),
        y: d3.extent(y_array)
      }

      return acc_data_extents;
    },  {x: [0,0], y: [0,0]})

    return series_data_extent;
  }

  // Scale is a domain to range mapping in x and y.
  //   Domain - min, max data value (extent)
  //   Range  - min, max bounding box.
  //
  compute_scales(internal_box, data_extents){
    let scales = { 
      x: d3.scaleLinear(), 
      y: d3.scaleLinear() 
    }

    scales.x = d3.scaleLinear()
      .rangeRound([0, internal_box.width])  // Range 
      .domain(data_extents.x)               // Domain
      .nice()

    scales.y = d3.scaleLinear()
      .rangeRound([internal_box.height, 0])
      .domain(data_extents.y)
      .nice()
    // .interpolate("basis")

    return scales
  }

  getContainerDimensions() {
    //var rootElement = this.elementRef.nativeElement;
    //var childElement = rootElement.firstElementChild;
    //var contentElement =  childElement.firstElementChild;

    //return {
      //height: contentElement.clientHeight,
      //width: contentElement.clientWidth
    //};
    //  height: this.el.nativeElement.height,
    //  width: this.el.nativeElement.width
    return {
      height: this.el.nativeElement.height,
      width: 500
    }
  }

  tooltip_html(dot, series) { 
    return series.id  + '<br>' +
      'x: ' + dot.x.toFixed(2) + '<br>' +
      'y: ' + dot.y.toFixed(2)
  }
 
  //myupdate() { 
  ngOnChanges(changes: SimpleChanges) {
    console.log("ngOnChanges.enter ...................................................")

    // this.title = 'tour of heros3';

    for (let propName in changes) {
      let chng = changes[propName];
      let cur  = JSON.stringify(chng.currentValue);
      let prev = JSON.stringify(chng.previousValue);
      this.changeLog.push(`${propName}: currentValue = ${cur}, previousValue = ${prev}`);
    }

    console.log("ngOnChanges.exit ...................................................")
  }

  do_scales(){
    if(this.series_set) {
      let data_extents   = this.compute_data_extents_all_series(this.series_set)
             this.scales = this.compute_scales(this.boxes.internal, data_extents)

    }
  }

  zoomed_redraw(){
    let e = (<d3.ZoomEvent> d3.event);

    console.log("zoom event: "  +  d3.event.transform);
    console.log("zoom target: " +  d3.event.target);
    console.log("zoom e.translate: " +  e.transform.translate);
    console.log("zoom e.scale: " +  e.transform.scale);

    let transform = d3.event.transform;

    this.scales.x = transform.rescaleX(this.scales.x);
    this.scales.y = transform.rescaleY(this.scales.y);

    //let new_scales = {
    //  x: transform.rescaleX(this.scales.x),
    //  y: transform.rescaleY(this.scales.y)
    // }

    //this.scales.x = s_x;
    //this.scales.y = s_y;
    
  }

  ngOnInit() {
    console.log("ngOnInit.enter ..............................................")
  
    // this.title = 'tour of heros2';

    let width  = 600
    let height = width * 0.75

    //this.boxes = this.compute_size( 500, 500);

    let box = this.getContainerDimensions();
    //this.boxes = this.compute_size( box.width, box.height);
    this.boxes = this.compute_size( width, height);

    this.titles = {
      x_axis: 'x_axis',
      y_axis: 'y_axis'
    }

    this.do_scales();
    
    this.zoomer = d3.zoom()
      .on("zoom", this.zoomed_redraw.bind(this))
      .scaleExtent([0.2, 8.0]) // Min, Max allowed scale factor
    
      console.log("ngOnInit.exit ...................................................")
  }

  ngAfterViewInit() {
    let container = d3.select(this.template_as_child.nativeElement);
    container.call(this.zoomer);

    this.do_scales();

    let scale = this.scales.x;
    //this.zoomed.x(scale);
    //this.zoom.y(ctrl.scales.xy.y)


  }

}
