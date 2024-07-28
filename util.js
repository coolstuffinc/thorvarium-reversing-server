const _hexChar = new Array("0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F");
const _binChar = new Array(-1,-1,-1,-1,-1,-1,-1,-1,-1,-2,-2,-1,-1,-2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,1,2,3,4,5,6,7,8,9,-1,-1,-1,-1,-1,-1,-1,10,11,12,13,14,15,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,10,11,12,13,14,15,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1);
const decode = function(type, str)
{
   var _loc4_ = new String(str);
   var _loc5_ = "";
   if(type == "text/binhex")
   {
      var _loc6_ = 0;
      var _loc7_ = 0;
      var _loc8_ = 0;
      var _loc9_ = 0;
      var _loc10_ = "";
      var _loc11_ = 0;
      while(_loc11_ < _loc4_.length)
      {
         _loc9_ = _loc4_.charCodeAt(_loc11_);
         _loc8_ = _binChar[_loc9_];
         if(_loc8_ == -1)
         {
            return "Error at char position " + _loc11_ + ":  " + _loc4_.charAt(_loc11_);
         }
         if(_loc8_ != -2)
         {
            if(_loc6_ % 2 == 0)
            {
               _loc7_ |= _loc8_ << 4;
            }
            else
            {
               _loc7_ |= _loc8_ & 15;
               _loc10_ = String.fromCharCode(_loc7_);
               _loc5_ += _loc10_;
               _loc7_ = 0;
            }
            _loc6_ = _loc6_ + 1;
         }
         _loc11_ = _loc11_ + 1;
      }
   }
   else if(type == "text/plain")
   {
      _loc5_ = str;
   }
   else
   {
      console.warn("No codec for type \'" + type + "\' - defaulting to no decoding");
      _loc5_ = str;
   }
   return _loc5_;
};

module.exports = { decode }
