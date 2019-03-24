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

  getHeroNo404<Data>(id: number): Observable<Hero> {
    const url= `${this.heroesUrl}/?id=${id}`;
    return this.http.get<Hero[]>(url)
      .pipe(
        map(heroes => heroes[0]), //returnsa {0|1) element array}
        tap(h => {
          const outcome = h ? `fetched` : `did not find`;
          this.log(`${outcome} hero id=${id}`);
        }),
        catchError(this.handleError<Hero>(`getHero id=${id}`))
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
      tap(_ => this.log(`updated hero id=${hero.id}`)),
      catchError(this.handleError<any>('updateHero'))
    );
  }

  addHero( hero : Hero): Observable<Hero> {
      return this.http.post<Hero>(this.heroesUrl, hero, httpOptions).pipe(
        tap((newHero: Hero) => this.log(`Added hero with id: ${newHero.id}`)),
        catchError(this.handleError<Hero>('addHero'))
      );
  }

  deleteHero (hero: Hero | number): Observable<Hero> {
    const id = typeof hero === 'number' ? hero : hero.id;
    const url = `${this.heroesUrl}/${id}`;

    return this.http.delete<Hero>(url, httpOptions).pipe(
      tap(_ => this.log(`deleted hero id: ${id}`)),
      catchError(this.handleError<Hero>('deleteHero'))
    );
  }

  searchHeroes(term: string): Observable<Hero[]> {
    if(!term.trim()) {
      //search term empty.
      return of([]);
    }

    return this.http.get<Hero[]>(`${this.heroesUrl}/?name=${term}`).pipe(
      tap(_ => this.log(`found heroes matching "${term}"`)),
      catchError(this.handleError<Hero[]>('searchHeroes', []))
    );
  }
}
