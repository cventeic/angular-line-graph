import {Provider, Component, EmbeddedViewRef, Input, TemplateRef, ViewContainerRef, AfterViewInit, ElementRef, ViewChild} from '@angular/core';
import { SimpleChanges } from '@angular/core';


import * as _ from 'underscore';
import * as d3 from 'd3';


@Component({
  selector: '[graph-axis]',
  templateUrl: './line-graph-axis.component.html',
  styleUrls: ['./line-graph-axis.component.css']
})
export class LineGraphAxisComponent implements AfterViewInit {

  @Input() orient:string;
  @Input() scale;
  @ViewChild('myname') template_as_child; 

  axis;

  constructor(private _viewContainer: ViewContainerRef) { }

  ngAfterViewInit() {

    //let parameters = ['scale', 'orient', 'ticks', 'tickValues', 'tickSubdivide', 'tickSize', 'tickPadding', 'tickFormat']
    // for p in parameters when scope[p] axis[p](scope[p])
    
    this.axis = null; 

    switch(this.orient){
      case "left":
        this.axis = d3.axisLeft();
        break;
      case "bottom":
        this.axis = d3.axisBottom()
        break;
    }

    this.axis
      .scale(this.scale)
      .ticks(8)
    //  .tickSize(-height);

    let container = d3.select(this.template_as_child.nativeElement);

    let rendered_axis = container.call(this.axis)
  }

  //myupdate() { 
  ngOnChanges(changes: SimpleChanges) {
    console.log("axis ngOnChanges.enter ...................................................")

    if(this.axis == null){
      console.log("axis ngOnChanges.exit  null ");
      return;
    }

    this.axis.scale(this.scale)


    let container = d3.select(this.template_as_child.nativeElement);

    let rendered_axis = container.call(this.axis)


    console.log("axis ngOnChanges.exit...................................................")
  }


}


