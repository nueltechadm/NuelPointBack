import './declaration';


String.prototype.To = function<T>() : T 
{
   return JSON.parse(this.toString()) as T;
}