import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';

import { Hero } from './hero';
import { MessageService } from './message.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap} from 'rxjs/operators';

const httpOptions = {
      headers: new HttpHeaders({'Content-Type': 'application/json'})
    };
@Injectable({
  providedIn: 'root',
})
export class HeroService {

  private heroesUrl = 'app/heroes'; //url to web api
  

  constructor(
    private http: HttpClient,
    private messageService: MessageService) { }

  private log(message: string){
    this.messageService.add(`HeroService: ${message}`);
  }

  getHeroes(): Observable<Hero[]> {
    return this.http.get<Hero[]>(this.heroesUrl)
    .pipe(
      tap(_ => this.log('fetched heroes')),
      catchError(this.handleError<Hero[]>('getHeroes', []))
    );
    }

  getHero(id: number): Observable<Hero> {
    //TODO: Send message after fetching hero.
    const url =`${this.heroesUrl}/${id}`;
    return this.http.get<Hero>(url).pipe(
      tap(_ => this.log(`fetched hero id=${id}`)),
      catchError(this.handleError<Hero>(`getHero id=${id}`))
    );
  }

  //Handle HTTP operation that failed
  //let app continue
  // @param operation - name of op that failed
  // @param result - optional value to return as observable result
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      //TODO: send error to remote logging infrastructure
      console.error(error); //log to console instead

      //TODO: better jobof transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      //let app keep running by returning empty result
      return of(result as T);
    };
  }

  updateHero (hero: Hero): Observable<any> {

    return this.http.put(this.heroesUrl, hero, httpOptions).pipe(
      tap(_=> this.log(`updated hero id=${hero.id}`)),
      catchError(this.handleError<any>('updateHero'))
    );
  }
}
