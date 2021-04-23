/***************************************************
 * auth.service
 * 
 * This file allows components throughout the project
 * to login/register, access user's token, create, 
 * edit, and delete quotes, and logout
 * 
 **************************************************/

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators'
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { LayoutStyleBuilder } from '@angular/flex-layout';
import { ItemService } from '../app/shared/services/item.service';
//import { Console } from 'node:console';
//import { totalmem } from 'node:os';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  headers = new HttpHeaders().set('Content-Type', 'application/json');

  //endpoints
  private endpoint = "http://localhost:3000/api"

  currentUser = {};
  currentUserID: number = 0;
  currentUserRole: number = 0;


  constructor(private http: HttpClient, public _router: Router) { }

  // Service to call the register API
  registerUser(user: any) {
    let api = `${this.endpoint}/register`
    return this.http.post<any>(api, user)
      .pipe(
        catchError(this.handleError)
      )
  }
  
  // Service to call the register API
  createQuote(quote: any) {
    // quote.username = this.getCurrentID();
    quote.quoteID = this.getNextQuoteID();
    let api = `${this.endpoint}/newQuote`
    return this.http.post<any>(api, quote)
      .pipe(
        catchError(this.handleError)
      )
  }

  // Load user by id
  loadUser(id: any): Observable<any> {
    let url = `${this.endpoint}/loaduser/${id}`;
    return this.http.get(url, {headers: this.headers}).pipe(
      map((res: any) => {
        return res || {}
      }),
      catchError(this.handleError)
    )
  }

  // Load quote by id
  loadQuote(id: any): Observable<any> {
    let url = `${this.endpoint}/loadquote/${id}`;
    return this.http.get(url, {headers: this.headers}).pipe(
      map((res: any) => {
        return res || {}
      }),
      catchError(this.handleError)
    )
  }

  // Updates user data by id
  updateUser(_id: any, user: any): Observable<any> {
    let url = `${this.endpoint}/updateuser/${_id}`;
    return this.http.put(url, user, { headers: this.headers }).pipe(
      catchError(this.handleError)
    )
  }

  // Updates quote by id
  updateQuote(_id: any, user: any): Observable<any> {
    let url = `${this.endpoint}/updatequote/${_id}`;
    return this.http.put(url, user, { headers: this.headers }).pipe(
      catchError(this.handleError)
    )
  }

  // Deletes user by id
  deleteUser(_id: string): Observable<any> {
    let url = `${this.endpoint}/deleteuser/${_id}`;
    // console.log('Gave (' + _id + ') to deleteUser. Sending to API now.')
    return this.http.delete(url, { headers: this.headers }).pipe(
      catchError(this.handleError)
    )
  }

  // Updates quote by id
  deleteQuote(_id: string): Observable<any> {
    let url = `${this.endpoint}/deletequote/${_id}`;
    // console.log('Gave (' + _id + ') to deleteUser. Sending to API now.')
    return this.http.delete(url, { headers: this.headers }).pipe(
      catchError(this.handleError)
    )
  }

  // Service to call the login API and set token
  loginUser(user: any) {
    return this.http.post<any>(`${this.endpoint}/login`, user)
  }

  // Service to remove user token and navigate to login
  logoutUser() {
    let authToken = localStorage.removeItem('token');

    if (authToken == null) {
      this._router.navigate(['login']);
    }
  }

  // Returns the user's token
  getToken() {
    return localStorage.getItem('token');
  }

  // Returns boolean if user has a token
  public get loggedIn(): boolean {
    let authToken = localStorage.getItem('token');
    return (authToken !== null) ? true : false;
  }

  // // DEPRECATED Returns API call for the entered user ID's role
  // public getUserRole(id: any) {
  //   let api = `${this.endpoint}/user/role/${id}`;
  //   let resp = this.http.get(api);

  //   return resp;
  // }

  // // DEPRECATED Returns the the current user's role
  // public getCurrentUserRole(id: any): Observable<any> {
  //   let api = `${this.endpoint}/user/role/${id}`;

  //   return this.http.get(api, { headers: this.headers }).pipe(
  //     map((res: any) => {
  //       return res || {}
  //     }),
  //     catchError(this.handleError)
  //   )
  // }

  // Returns the current user's information
  public getCurrentUser(id: any): Promise<any> {
    let api = `${this.endpoint}/user/${id}`;

    return this.http.get(api, { headers: this.headers }).toPromise()
  }

  // Returns the user's information from token
  public getUser(): Promise<any> {
    let api = `${this.endpoint}/user`;

    return this.http.get(api, { headers: this.headers }).toPromise()
  }

  // Returns ALL employee users from the database including hashed password
  public getUsers(): Observable<any> {
    let api = `${this.endpoint}/users`;

    return this.http.get(api, { headers: this.headers }).pipe(
      map((res: any) => {
        return res || {}
      }),
      catchError(this.handleError)
    )
  }

  public getQuotes(): Observable<any> {
    let api = `${this.endpoint}/quotes`;

    return this.http.get(api, { headers: this.headers }).pipe(
      map((res: any) => {
        return res || {}
      }),
      catchError(this.handleError)
    )
  }

  // Load commission by username
  getComm(username: any): Observable<any> {
    let api = `${this.endpoint}/commission/${username}`;
    return this.http.get(api, {headers: this.headers}).pipe(
      map((res: any) => {
        return res || {}
      }),
      catchError(this.handleError)
    )
  }

  public getComms(): Observable<any> {
    let api = `${this.endpoint}/commissions`;

    return this.http.get(api, { headers: this.headers }).pipe(
      map((res: any) => {
        return res || {}
      }),
      catchError(this.handleError)
    )
  }

  public getCurrentID() {
    return this.currentUserID;
  }

  public getCurrentRole() {
    return this.currentUserRole;
  }
  
  public getNextQuoteID() {
    var quoteList; //access all known quotes
    let nextID = 0; //initialize container
    this.getQuotes().subscribe((res:any) => {
      quoteList = res;
      for (let quote of quoteList) //for all quotes
      {
        if (quote.quoteID > nextID) { //check if this is the highest used quoteID
          nextID = quote.quoteID; //if so, store it
        }
      }
    });
    
    ++nextID; //increment by 1
    return nextID;
  }

  public updateCommission(username: any, commission: any)
  {
    console.log(username);
    console.log(commission);
    var commObj;
    this.getComm(username).subscribe((res : any) => { //get the list of all commission objects
      commObj = res;
      var _id, total; //container for Mongo-side id, total commission amt, and num commissions
      let num = 0;

      _id = commObj._id;
      console.log(username); //store this object's _id
      total = parseFloat(commObj.totalCommissionAmt); //store this user's current total
      num = parseInt(commObj.totalNumCommissions); //store this user's current num commissions\

      total += commission; //once found, add commission to that totalCommissionAmt
      ++num; // and increment the totalNumCommissions
      var updated = { "totalCommissionAmt":total, "totalNumCommissions":num };
  
      //PUT the changes back to the database
      let url = `${this.endpoint}/updatecommission/${_id}`;
      return this.http.put(url, updated, { headers: this.headers }).pipe(
        catchError(this.handleError) );
    }); 
  }

  public getParts(): Promise<any> {
    let api = `${this.endpoint}/parts`;
    return this.http.get(api, { headers: this.headers }).toPromise();
  }

  public getLegacy(): Promise<any> {
    let api = `${this.endpoint}/customers`;
    return this.http.get(api, { headers: this.headers }).toPromise();
  }

  public extPurchaseOrder(quoteData: any): Promise<any>{
    let api = `http://blitz.cs.niu.edu/PurchaseOrder/`
    return this.http.post<any>(api, quoteData).toPromise();
  }

  //find and aggregate necessary data, interface with the external purchase system, and update 
  // the necessary commission total
  public processOrder(targetID: any)
  {
    //var quote, userID, custID; //containers for info required by the purchase order system
    let amt = 0; //total amt for this quote
    var quoteList;
    this.getQuotes().subscribe((res: any) => {
      quoteList = res;
      var quote: any;
      for (let obj of quoteList) //for every quote in the database
      {
        if (obj.quoteID == targetID.quoteID) //find the quote with the target ID
        {
          quote = obj; //and store that quote
          break; //leaving the loop afterwards
        }
        
      }
      if (quote == null) //if that quote couldn't be found
      {
        console.log("returning");
        return; //leave the function
      }
      console.log(quote[<any>"username"]);

      //Next we need to get the associate ID number from the quote's username field
      var username = quote[<any>"username"];
      var userList;
      this.getUsers().subscribe((res: any) => {
        userList = res;
        var userID: any;
        console.log(username);
        for (let usr of userList)
        {
          if (usr.username === username)
          {
            userID = usr._id; //store their ID
            console.log(userID);
            break; //leaving the loop afterwards
          }
        }
        if (userID == null) //if no matching user was found
          return; //leave the function

    //Next we need to get the customer ID from the Legacy Database
    var legacy;
    this.getLegacy().then((res: any) => { //get the legacy database
      legacy = res;
      var custID: any;
      var custName = quote[<any>"customer"]; //get the target customer
      for (let cust of legacy) //for all customers in the db
      {
        if (cust.name == custName)
        {
          custID = cust.id; //store the matching ID from the legacy db
          console.log(custID);
          break; //and leave the loop
        }
      }
      if (custID == null) //if the customer couldn't be found
        return; //leave the function
  
      //Next, we'll need to calculate the total amount for the order
      var itemList;
      this.getParts().then((res: any) => { //get the parts list
        itemList = res;
        let qItems = quote[<any>"items"]; //store array of items in the quote
        for (let itemTarget of qItems) //for every item in the quote
        {
          for (let dbItem of itemList) //look through all possible items
          {
            if (dbItem.description === itemTarget.name) //if they have the same name
            {
              let price = dbItem.price; //get the item's price from the db
              let count = itemTarget.count; //get the count of that item from the quote
              amt += ( parseFloat(price) * parseInt(count) );
              console.log(amt);
              break; //break out of the inner loop AKA move on to the next item in the quote
            }
          }
        }
        if (amt === 0) //if no items could be correctly compared
          return; //leave the function
  
      //Lastly, we need to generate and order number
      //this is done using a set prefix and a random number
      let orderNum = "xyz-" + Math.floor(Math.random() * 1000).toString();
  
      //combine these variables into a JSON object and send it off to the external system
      var quoteData = { "order": orderNum , "associate": userID, "custid": custID, "amount": amt};
      this.extPurchaseOrder(quoteData).then((res: any) => {
        console.log(res);
        var percentage = res.commission;
        console.log(percentage);
        let commPct = (parseInt(percentage.slice(0,-1)) /100); //remove the percent sign and convert to an float percentage
        //commPct = Math.round(((commPct * 100) + Number.EPSILON) / 100)
        let commission = commPct * amt; //calculate the total commission
        commission = Math.round((commission * 100) + Number.EPSILON) / 100;
        this.updateCommission(username, commission); //update that user's commission total with the current amount
      }),catchError(this.handleError)
      }) 
    })
    })   
  });
  }

  handleError(error: HttpErrorResponse) {
    let msg = '';

    if (error.error instanceof ErrorEvent) {
      msg = error.error.message;
    }
    else {
      msg = `Error code: ${error.status}\nMessage: ${error.message}`;
    }

    return throwError(msg);
  }
}
