import './declaration';


String.prototype.To = function<T>() : T 
{
   return JSON.parse(this.toString()) as T;
}

String.prototype.Trim = function() : string
{
   return this.trim();
}