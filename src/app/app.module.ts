import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { LineGraphComponent } from './line-graph/line-graph.component';
import { LineGraphAxisComponent } from './line-graph-axis/line-graph-axis.component';

@NgModule({
  declarations: [
    AppComponent,
    LineGraphComponent,
    LineGraphAxisComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [],
  bootstrap: [AppComponent, LineGraphComponent]
})
export class AppModule { }
