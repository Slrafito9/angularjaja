import { isNgTemplate } from '@angular/compiler';
import { Component, OnInit, EventEmitter } from '@angular/core';
import { CalendarEvent, CalendarMonthViewDay } from 'angular-calendar'
import { CalendarEventActionsComponent } from 'angular-calendar/modules/common/calendar-event-actions.component';
import { Subject } from 'rxjs'

class AgendaDayData
{
  date: Date = new Date();
  toDoList: {name: string, done: boolean}[] = [];
  notes: string = "";
}

@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.component.html',
  styleUrls: ['./agenda.component.scss']
})
export class AgendaComponent implements OnInit {

  viewDate: Date = new Date();
  events: CalendarEvent[] = [];
  weekendDays = [0, 6];
  weekStartsOn = 1;
  refreshCalendar: Subject<boolean> = new Subject<boolean>();
  
  dayData = new Map();
  currentDayData: AgendaDayData = new AgendaDayData();
  showDayPopup: boolean = false;

  constructor() {
    this.refreshCalendar.next(false);
  }

  ngOnInit(): void {
  }

  goToPrevMonth(): void
  {
    let month = this.viewDate.getMonth();
    if (month == 1)
    {
      month = 12;
      this.viewDate.setFullYear(this.viewDate.getFullYear() - 1);
    }
    else
      month -= 1;
    this.viewDate.setMonth(month);
    this.viewDate = new Date(this.viewDate);
    this.refreshCalendar.next(true);
  }

  goToNextMonth(): void
  {
    let month = this.viewDate.getMonth();
    if (month == 12)
    {
      month = 1;
      this.viewDate.setFullYear(this.viewDate.getFullYear() + 1);
    }
    else
      month += 1;
    this.viewDate.setMonth(month);
    this.viewDate = new Date(this.viewDate);
    this.refreshCalendar.next(true);
  }

  onDayClicked(event: { day: CalendarMonthViewDay, sourceEvent: MouseEvent | any }): void
  {
    this.showDayPopup = true;
    let day = this.dayData.get(event.day.date.toDateString());
    this.currentDayData = new AgendaDayData();
    if(day == undefined)
    {
      this.currentDayData.date = event.day.date;
    }
    else
    {
      let newObj: AgendaDayData = (JSON.parse(JSON.stringify(day))) as AgendaDayData;
      this.currentDayData.date = new Date(newObj.date);
      this.currentDayData.toDoList = newObj.toDoList;
      this.currentDayData.notes = newObj.notes;
    }
  }

  onDayPopupCloseClicked(save: boolean): void
  {
    this.showDayPopup = false;
    if(save)
    {
      this.dayData.set(this.currentDayData.date.toDateString(), this.currentDayData);
        console.log(this.dayData);

        //Update the calendar
        this.events.splice(0, this.events.length);
        this.dayData.forEach((value: AgendaDayData, key: string) => {
        let dayEvents: CalendarEvent[] = [];
        //Events for the to-do list
        value.toDoList.forEach((element: {name: string, done: boolean}) =>{
        if(!element.done)
          dayEvents.push({start: value.date, end: value.date, title: element.name});
        });
        //Event for the notes
        if(value.notes != "")
          dayEvents.push({start: value.date, end: value.date, title: value.notes});

        //Add the new events to the list
        dayEvents.forEach((evt: CalendarEvent) =>{
          this.events.push(evt);
        });
        this.refreshCalendar.next(true);
        console.log(dayEvents);
      });
    }
  }

  toggleToDoElement(index: number): void
  {
    this.currentDayData.toDoList[index].done = !this.currentDayData.toDoList[index].done;
  }

  onDayPopupAddToDoElement(): void
  {
    let newTaskBox = <HTMLInputElement>document.getElementById("new-to-do-element-box");
    if(newTaskBox != null)
    {
      let newTask = newTaskBox.value;
      if(newTask != null && newTask.length > 0)
      {
        this.currentDayData.toDoList.push({name: newTask, done: false});
        newTaskBox.value = "";
      }
    }
  }

  onDayPopupNotesChanged(): void
  {
    let notesBox = <HTMLTextAreaElement>document.getElementById("notes-box");
    if(notesBox != null)
    {
      let notes = notesBox.value;
      if(notes != null)
      {
        this.currentDayData.notes = notes;
      }
    }
  }
}
