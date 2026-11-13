package avatar
{
   import Enums.DenItemDef;
   import collection.AccItemCollection;
   import den.DenMannequinInventory;
   import flash.display.MovieClip;
   import gui.LoadingSpiral;
   import item.Item;
   import item.ItemXtCommManager;
   import room.RoomManagerWorld;

   public class MannequinData
   {

      public var baseColor:uint;

      public var patternColor:uint;

      public var patternDefId:int;

      public var eyeColor:uint;

      public var eyeDefId:int;

      public var tailInvId:int;

      public var legInvId:int;

      public var backInvId:int;

      public var neckInvId:int;

      public var headInvId:int;

      public var tailColor:uint;

      public var tailDefId:int;

      public var legColor:uint;

      public var legDefId:int;

      public var backColor:uint;

      public var backDefId:int;

      public var neckColor:uint;

      public var neckDefId:int;

      public var headColor:uint;

      public var headDefId:int;

      public var invIdx:int;

      // everything it wears, as an animal may (three to a layer, not one to
      // each of the five places the game had): {i: inventory id, d: def,
      // c: colour}, the bottom first when `ordered`. the five *InvId/
      // *DefId/*Color above are kept to the first piece in each place, for
      // the code that still reads them. the server sends these after the
      // rest (readPieces) and takes them back with the head (headField).
      public var pieces:Array = [];

      // true when the owner put the pieces in an order of their own
      // (the avatar editor's layers panel)
      public var ordered:Boolean;

      private var _mannequinAvatarView:AvatarView;

      private var _mannaquinLoadingSpiral:LoadingSpiral;

      private var _viewContainer:MovieClip;

      private var _denDef:DenItemDef;

      private var _isLoading:Boolean;

      private var _refreshAvatarView:Boolean;

      private var _isMyItem:Boolean;

      public function MannequinData()
      {
         super();
      }

      public function init(param1:DenItemDef, param2:Object, param3:int, param4:Boolean, param5:int, param6:Boolean) : int
      {
         _isMyItem = param6;
         invIdx = param5;
         var _loc7_:AvatarDef = gMainFrame.userInfo.getAvatarDefByAvType(param1.mannequinAvatarDefId,false);
         if(param2 != null)
         {
            if(param4)
            {
               return setupDataInvIdsOnly(_loc7_,param2,param3);
            }
            return setupDataFull(_loc7_,param2,param3);
         }
         baseColor = _loc7_.mannequinColorLayer1;
         patternColor = _loc7_.mannequinColorLayer2;
         patternDefId = _loc7_.defPattern;
         eyeColor = _loc7_.mannequinColorLayer3;
         eyeDefId = _loc7_.defEyes;
         tailInvId = 0;
         legInvId = 0;
         backInvId = 0;
         neckInvId = 0;
         headInvId = 0;
         pieces = [];
         ordered = false;
         return param3;
      }

      public function clone() : MannequinData
      {
         var _loc1_:MannequinData = new MannequinData();
         _loc1_._isMyItem = _isMyItem;
         _loc1_.invIdx = invIdx;
         _loc1_.baseColor = baseColor;
         _loc1_.patternColor = patternColor;
         _loc1_.patternDefId = patternDefId;
         _loc1_.eyeColor = eyeColor;
         _loc1_.eyeDefId = eyeDefId;
         _loc1_.tailInvId = tailInvId;
         _loc1_.legInvId = legInvId;
         _loc1_.backInvId = backInvId;
         _loc1_.neckInvId = neckInvId;
         _loc1_.headInvId = headInvId;
         _loc1_.tailColor = tailColor;
         _loc1_.tailDefId = tailDefId;
         _loc1_.legColor = legColor;
         _loc1_.legDefId = legDefId;
         _loc1_.backColor = backColor;
         _loc1_.backDefId = backDefId;
         _loc1_.neckColor = neckColor;
         _loc1_.neckDefId = neckDefId;
         _loc1_.headColor = headColor;
         _loc1_.headDefId = headDefId;
         _loc1_.pieces = copyPieces(pieces);
         _loc1_.ordered = ordered;
         return _loc1_;
      }

      public function get mannequinAvatarView() : AvatarView
      {
         return _mannequinAvatarView;
      }

      public function hasThisInvIdOnAndRemove(param1:int) : Boolean
      {
         var _loc2_:int = pieceIndex(param1);
         if(param1 <= 0 || _loc2_ < 0)
         {
            return false;
         }
         pieces.splice(_loc2_,1);
         if(pieces.length == 0)
         {
            ordered = false;
         }
         syncSlots();
         return true;
      }

      // the order for its AvatarView (AvatarUtility.resolveLayerOrder), null
      // for the game's own
      public function get layerOrder() : Array
      {
         var _loc1_:Object = null;
         if(!ordered || pieces.length == 0)
         {
            return null;
         }
         var _loc2_:Array = [];
         for each(_loc1_ in pieces)
         {
            _loc2_.push({
               "d":int(_loc1_.d),
               "i":int(_loc1_.i)
            });
         }
         return _loc2_;
      }

      // what it wears now: `param1` {i, d, c} (or Items), the bottom first,
      // `param2` true when that order is the owner's own
      public function setPieces(param1:Array, param2:Boolean) : void
      {
         var _loc3_:Object = null;
         pieces = [];
         for each(_loc3_ in param1)
         {
            if(_loc3_ is Item)
            {
               pieces.push({
                  "i":Item(_loc3_).invIdx,
                  "d":Item(_loc3_).defId,
                  "c":Item(_loc3_).color
               });
            }
            else
            {
               pieces.push({
                  "i":int(_loc3_.i),
                  "d":int(_loc3_.d),
                  "c":uint(_loc3_.c)
               });
            }
         }
         ordered = param2 && pieces.length > 0;
         syncSlots();
      }

      // the field after the den item's in "di" and "ds" (lib/dens.js
      // mannequinTail): "0~" + "o" when ordered + "~" + "def_colour_inv"
      // joined by ".", the bottom first. false when it is not one (a server
      // that sends only the five places). `param2`: mark the pieces as on
      // this mannequin, for the owner's own inventory.
      public function readPieces(param1:*, param2:Boolean) : Boolean
      {
         var _loc3_:Array = String(param1).split("~");
         var _loc4_:Array = [];
         var _loc5_:String = null;
         var _loc6_:Array = null;
         if(_loc3_.length != 3)
         {
            return false;
         }
         for each(_loc5_ in String(_loc3_[2]).split("."))
         {
            _loc6_ = _loc5_.split("_");
            if(_loc6_.length == 3 && int(_loc6_[0]) > 0)
            {
               _loc4_.push({
                  "d":int(_loc6_[0]),
                  "c":uint(_loc6_[1]),
                  "i":int(_loc6_[2])
               });
            }
         }
         // the five places stay as the server sent them (the first piece in
         // each): working them out needs the item defs, which may not be in yet
         pieces = _loc4_;
         ordered = _loc3_[1] == "o" && _loc4_.length > 0;
         if(param2)
         {
            setupMannequinInventory();
         }
         return true;
      }

      // what the den editor sends for the head place (DenXtCommManager.
      // requestDenStateChange): the head's own inventory id, as the game
      // sent, then the flag and every piece's inventory id (lib/dens.js
      // readMannequin)
      public function get headField() : String
      {
         var _loc1_:Object = null;
         var _loc2_:Array = [];
         for each(_loc1_ in pieces)
         {
            _loc2_.push(int(_loc1_.i));
         }
         return headInvId + "~" + (ordered ? "o" : "") + "~" + _loc2_.join(".");
      }

      public function hasPiece(param1:int) : Boolean
      {
         return param1 > 0 && pieceIndex(param1) >= 0;
      }

      private function pieceIndex(param1:int) : int
      {
         var _loc2_:int = 0;
         while(_loc2_ < pieces.length)
         {
            if(int(pieces[_loc2_].i) == param1)
            {
               return _loc2_;
            }
            _loc2_++;
         }
         return -1;
      }

      private static function copyPieces(param1:Array) : Array
      {
         var _loc2_:Object = null;
         var _loc3_:Array = [];
         for each(_loc2_ in param1)
         {
            _loc3_.push({
               "i":_loc2_.i,
               "d":_loc2_.d,
               "c":_loc2_.c
            });
         }
         return _loc3_;
      }

      // which of the five places a clothing layer is in (0 tail .. 4 head), -1 none
      private static function placeOf(param1:int) : int
      {
         if(param1 >= 4 && param1 <= 7)
         {
            return param1 - 4;
         }
         return param1 >= 8 && param1 <= 10 ? 4 : -1;
      }

      private static function layerOfDef(param1:int) : int
      {
         var _loc2_:Object = null;
         try
         {
            _loc2_ = ItemXtCommManager.getItemDef(param1);
         }
         catch(e:Error)
         {
            // the item defs are not in yet
         }
         return _loc2_ != null ? int(_loc2_.layerId) : 0;
      }

      // the five places from the pieces: the first piece in each
      private function syncSlots() : void
      {
         var _loc1_:Object = null;
         var _loc2_:int = 0;
         var _loc3_:Array = [null,null,null,null,null];
         for each(_loc1_ in pieces)
         {
            _loc2_ = placeOf(layerOfDef(int(_loc1_.d)));
            if(_loc2_ >= 0 && _loc3_[_loc2_] == null)
            {
               _loc3_[_loc2_] = _loc1_;
            }
         }
         tailInvId = _loc3_[0] ? int(_loc3_[0].i) : 0;
         tailDefId = _loc3_[0] ? int(_loc3_[0].d) : 0;
         tailColor = _loc3_[0] ? uint(_loc3_[0].c) : 0;
         legInvId = _loc3_[1] ? int(_loc3_[1].i) : 0;
         legDefId = _loc3_[1] ? int(_loc3_[1].d) : 0;
         legColor = _loc3_[1] ? uint(_loc3_[1].c) : 0;
         backInvId = _loc3_[2] ? int(_loc3_[2].i) : 0;
         backDefId = _loc3_[2] ? int(_loc3_[2].d) : 0;
         backColor = _loc3_[2] ? uint(_loc3_[2].c) : 0;
         neckInvId = _loc3_[3] ? int(_loc3_[3].i) : 0;
         neckDefId = _loc3_[3] ? int(_loc3_[3].d) : 0;
         neckColor = _loc3_[3] ? uint(_loc3_[3].c) : 0;
         headInvId = _loc3_[4] ? int(_loc3_[4].i) : 0;
         headDefId = _loc3_[4] ? int(_loc3_[4].d) : 0;
         headColor = _loc3_[4] ? uint(_loc3_[4].c) : 0;
      }

      // the pieces from the five places (a server that sent only those)
      private function piecesFromSlots() : void
      {
         var _loc1_:Array = [];
         if(tailInvId > 0 || tailDefId > 0)
         {
            _loc1_.push({"i":tailInvId,"d":tailDefId,"c":tailColor});
         }
         if(legInvId > 0 || legDefId > 0)
         {
            _loc1_.push({"i":legInvId,"d":legDefId,"c":legColor});
         }
         if(backInvId > 0 || backDefId > 0)
         {
            _loc1_.push({"i":backInvId,"d":backDefId,"c":backColor});
         }
         if(neckInvId > 0 || neckDefId > 0)
         {
            _loc1_.push({"i":neckInvId,"d":neckDefId,"c":neckColor});
         }
         if(headInvId > 0 || headDefId > 0)
         {
            _loc1_.push({"i":headInvId,"d":headDefId,"c":headColor});
         }
         pieces = _loc1_;
         ordered = false;
      }

      public function setToAvatarBoxFrame() : void
      {
         if(_mannequinAvatarView && _viewContainer)
         {
            _viewContainer.gotoAndStop(2);
         }
      }

      public function setupMannequinAvatarView(param1:DenItemDef, param2:MovieClip) : AvatarView
      {
         var _loc3_:Avatar = null;
         if(!_isLoading)
         {
            if(_mannequinAvatarView && _mannequinAvatarView.parent)
            {
               _viewContainer.avatarBox.removeChild(_mannequinAvatarView);
               _mannequinAvatarView.destroy();
            }
            _refreshAvatarView = false;
            _isLoading = true;
            _viewContainer = param2;
            _denDef = param1;
            _viewContainer.gotoAndStop(2);
            _mannaquinLoadingSpiral = new LoadingSpiral(_viewContainer.avatarBox);
            _loc3_ = new Avatar();
            _loc3_.avName = param1.name;
            _loc3_.init(-1,-1,_loc3_.avName,param1.mannequinAvatarDefId,[baseColor,patternColor,eyeColor],-1,null,"",-1,AvatarManager.roomEnviroType,null,null,null,null,null,true);
            if(RoomManagerWorld.instance.isMyDen || _isMyItem)
            {
               _loc3_.userName = gMainFrame.userInfo.myUserName;
               _loc3_.avInvId = gMainFrame.userInfo.playerAvatarInfo.avInvId;
               _loc3_.itemResponseIntegrate(generateBodModsAndClothingList(true));
            }
            else
            {
               _loc3_.itemResponseIntegrate(generateBodModsAndClothingList(false));
            }
            _mannequinAvatarView = new AvatarView();
            _mannequinAvatarView.init(_loc3_);
            _mannequinAvatarView.setLayerOrder(layerOrder);
            _mannequinAvatarView.playAnim(param1.mannequinCatId,false,3,onMannequinAvatarViewLoaded);
            _mannequinAvatarView.frame = param1.mannequinFrame;
            switch(param1.mannequinAvatarDefId)
            {
               case 33:
                  _mannequinAvatarView.x = 20;
                  _mannequinAvatarView.y = 33;
                  break;
               case 28:
                  _mannequinAvatarView.x = 11;
                  _mannequinAvatarView.y = 29;
                  break;
               case 29:
                  _mannequinAvatarView.x = 5;
                  _mannequinAvatarView.y = 36;
                  break;
               case 8:
                  _mannequinAvatarView.x = 30;
                  _mannequinAvatarView.y = 30;
                  break;
               case 4:
                  _mannequinAvatarView.x = 19;
                  _mannequinAvatarView.y = 30;
                  break;
               case 25:
                  _mannequinAvatarView.x = 19;
                  _mannequinAvatarView.y = 34;
                  break;
               case 18:
                  _mannequinAvatarView.x = 23;
                  _mannequinAvatarView.y = 30;
                  break;
               case 24:
                  _mannequinAvatarView.x = 25;
                  _mannequinAvatarView.y = 33;
                  break;
               case 1:
                  _mannequinAvatarView.x = 22;
                  _mannequinAvatarView.y = 31;
                  break;
               case 6:
                  _mannequinAvatarView.x = 16;
                  _mannequinAvatarView.y = 30;
                  break;
               case 5:
                  _mannequinAvatarView.x = 17;
                  _mannequinAvatarView.y = 35;
                  break;
               case 37:
                  _mannequinAvatarView.x = 22;
                  _mannequinAvatarView.y = 35;
                  break;
               case 15:
                  _mannequinAvatarView.x = 35;
                  _mannequinAvatarView.y = 33;
                  break;
               case 14:
                  _mannequinAvatarView.x = 16;
                  _mannequinAvatarView.y = 33;
                  break;
               case 38:
                  _mannequinAvatarView.x = 20;
                  _mannequinAvatarView.y = 33;
                  break;
               case 42:
                  _mannequinAvatarView.x = 12;
                  _mannequinAvatarView.y = 35;
                  break;
               case 16:
                  _mannequinAvatarView.x = 18;
                  _mannequinAvatarView.y = 33;
                  break;
               case 26:
                  _mannequinAvatarView.x = 17;
                  _mannequinAvatarView.y = 33;
                  break;
               case 10:
                  _mannequinAvatarView.x = 26;
                  _mannequinAvatarView.y = 36;
                  break;
               case 31:
                  _mannequinAvatarView.x = 11;
                  _mannequinAvatarView.y = 31;
                  break;
               case 45:
                  _mannequinAvatarView.x = 20;
                  _mannequinAvatarView.y = 34;
                  break;
               case 41:
                  _mannequinAvatarView.x = 20;
                  _mannequinAvatarView.y = 36;
                  break;
               case 3:
                  _mannequinAvatarView.x = 26;
                  _mannequinAvatarView.y = 36;
                  break;
               case 40:
                  _mannequinAvatarView.x = 30;
                  _mannequinAvatarView.y = 33;
                  break;
               case 35:
                  _mannequinAvatarView.x = 83;
                  _mannequinAvatarView.y = 65;
                  _mannequinAvatarView.scaleX = 0.6;
                  _mannequinAvatarView.scaleY = 0.6;
                  break;
               case 2:
                  _mannequinAvatarView.x = 53;
                  _mannequinAvatarView.y = 65;
                  _mannequinAvatarView.scaleX = 0.55;
                  _mannequinAvatarView.scaleY = 0.55;
                  break;
               case 13:
                  _mannequinAvatarView.x = 10;
                  _mannequinAvatarView.y = 33;
                  break;
               case 39:
                  _mannequinAvatarView.x = 90;
                  _mannequinAvatarView.y = 108;
                  _mannequinAvatarView.scaleX = 0.65;
                  _mannequinAvatarView.scaleY = 0.65;
                  break;
               case 11:
                  _mannequinAvatarView.x = 26;
                  _mannequinAvatarView.y = 36;
                  break;
               case 36:
                  _mannequinAvatarView.x = 15;
                  _mannequinAvatarView.y = 34;
                  break;
               case 44:
                  _mannequinAvatarView.x = 21;
                  _mannequinAvatarView.y = 30;
                  break;
               case 12:
                  _mannequinAvatarView.x = 70;
                  _mannequinAvatarView.y = 25;
                  _mannequinAvatarView.scaleX = 0.55;
                  _mannequinAvatarView.scaleY = 0.55;
                  break;
               case 20:
                  _mannequinAvatarView.x = 83;
                  _mannequinAvatarView.y = 40;
                  _mannequinAvatarView.scaleX = 0.6;
                  _mannequinAvatarView.scaleY = 0.6;
                  break;
               case 22:
                  _mannequinAvatarView.x = 77;
                  _mannequinAvatarView.y = 30;
                  _mannequinAvatarView.scaleX = 0.55;
                  _mannequinAvatarView.scaleY = 0.55;
                  break;
               case 21:
                  _mannequinAvatarView.x = 62;
                  _mannequinAvatarView.y = 26;
                  _mannequinAvatarView.scaleX = 0.5;
                  _mannequinAvatarView.scaleY = 0.5;
                  break;
               case 19:
                  _mannequinAvatarView.x = 68;
                  _mannequinAvatarView.y = 27;
                  _mannequinAvatarView.scaleX = 0.6;
                  _mannequinAvatarView.scaleY = 0.6;
                  break;
               case 34:
                  _mannequinAvatarView.x = 26;
                  _mannequinAvatarView.y = 30;
                  break;
               case 43:
                  _mannequinAvatarView.x = 26;
                  _mannequinAvatarView.y = 32;
                  break;
               case 23:
               case 9:
               case 27:
               case 17:
               case 7:
                  _mannequinAvatarView.x = 26;
                  _mannequinAvatarView.y = 32;
                  break;
               case 30:
                  _mannequinAvatarView.x = 20;
                  _mannequinAvatarView.y = 29;
                  break;
               case 32:
               case 46:
                  _mannequinAvatarView.x = 20;
                  _mannequinAvatarView.y = 34;
                  break;
               case 47:
                  _mannequinAvatarView.x = 23;
                  _mannequinAvatarView.y = 31;
            }
         }
         else
         {
            _refreshAvatarView = true;
         }
         return _mannequinAvatarView;
      }

      public function refreshAvatarItems() : void
      {
         if(_mannequinAvatarView != null)
         {
            if(_isLoading)
            {
               _refreshAvatarView = true;
            }
            else
            {
               recreateAvatarForView();
            }
         }
      }

      public function updateColors(param1:Array) : void
      {
         baseColor = param1[0];
         patternColor = param1[1];
         eyeColor = param1[2];
      }

      public function updateLayer(param1:Item, param2:Boolean) : void
      {
         var _loc3_:int = param1.layerId;
         switch(_loc3_ - 1)
         {
            case 0:
               break;
            case 1:
               patternDefId = param2 ? param1.defId : 0;
               patternColor = param2 ? param1.color : 0;
               break;
            case 2:
               eyeDefId = param1.defId;
               eyeColor = param1.color;
               break;
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
               if(param2)
               {
                  if(!hasPiece(param1.invIdx))
                  {
                     pieces.push({
                        "i":param1.invIdx,
                        "d":param1.defId,
                        "c":param1.color
                     });
                  }
               }
               else if(hasPiece(param1.invIdx))
               {
                  pieces.splice(pieceIndex(param1.invIdx),1);
               }
               if(pieces.length == 0)
               {
                  ordered = false;
               }
               syncSlots();
         }
      }

      public function removeItems() : void
      {
         var _loc1_:Object = null;
         for each(_loc1_ in pieces)
         {
            DenMannequinInventory.removeItemFromUse(int(_loc1_.i));
         }
         pieces = [];
         ordered = false;
         syncSlots();
      }

      public function compare(param1:MannequinData, param2:Boolean) : Boolean
      {
         if(param1 == null)
         {
            return false;
         }
         if(!samePieces(param1,param2))
         {
            return false;
         }
         if(param2)
         {
            if(baseColor == param1.baseColor && patternColor == param1.patternColor && patternDefId == param1.patternDefId && eyeColor == param1.eyeColor && eyeDefId == param1.eyeDefId && tailInvId == param1.tailInvId && legInvId == param1.legInvId && backInvId == param1.backInvId && neckInvId == param1.neckInvId && headInvId == param1.headInvId)
            {
               return true;
            }
            return false;
         }
         if(baseColor == param1.baseColor && patternColor == param1.patternColor && patternDefId == param1.patternDefId && eyeColor == param1.eyeColor && eyeDefId == param1.eyeDefId && tailColor == param1.tailColor && tailDefId == param1.tailDefId && legColor == param1.legColor && legDefId == param1.legDefId && backColor == param1.backColor && backDefId == param1.backDefId && neckColor == param1.neckColor && neckDefId == param1.neckDefId && headColor == param1.headColor && headDefId == param1.headDefId)
         {
            return true;
         }
         return false;
      }

      // the same pieces (by inventory id, or with `param2` false by def and
      // colour as well), in the same order when either has an order
      private function samePieces(param1:MannequinData, param2:Boolean) : Boolean
      {
         var _loc3_:int = 0;
         if(ordered != param1.ordered || pieces.length != param1.pieces.length)
         {
            return false;
         }
         var _loc4_:Array = keysOf(pieces,param2);
         var _loc5_:Array = keysOf(param1.pieces,param2);
         if(!ordered)
         {
            _loc4_.sort();
            _loc5_.sort();
         }
         while(_loc3_ < _loc4_.length)
         {
            if(_loc4_[_loc3_] != _loc5_[_loc3_])
            {
               return false;
            }
            _loc3_++;
         }
         return true;
      }

      private static function keysOf(param1:Array, param2:Boolean) : Array
      {
         var _loc3_:Object = null;
         var _loc4_:Array = [];
         for each(_loc3_ in param1)
         {
            _loc4_.push(param2 ? String(_loc3_.i) : _loc3_.d + "_" + _loc3_.c + "_" + _loc3_.i);
         }
         return _loc4_;
      }

      public function copyFromOther(param1:MannequinData) : void
      {
         _isMyItem = param1._isMyItem;
         invIdx = param1.invIdx;
         baseColor = param1.baseColor;
         patternColor = param1.patternColor;
         patternDefId = param1.patternDefId;
         eyeColor = param1.eyeColor;
         eyeDefId = param1.eyeDefId;
         tailInvId = param1.tailInvId;
         legInvId = param1.legInvId;
         backInvId = param1.backInvId;
         neckInvId = param1.neckInvId;
         headInvId = param1.headInvId;
         tailColor = param1.tailColor;
         tailDefId = param1.tailDefId;
         legColor = param1.legColor;
         legDefId = param1.legDefId;
         backColor = param1.backColor;
         backDefId = param1.backDefId;
         neckColor = param1.neckColor;
         neckDefId = param1.neckDefId;
         headColor = param1.headColor;
         headDefId = param1.headDefId;
         pieces = copyPieces(param1.pieces);
         ordered = param1.ordered;
         setupMannequinAvatarView(_denDef,_viewContainer);
      }

      private function setupBodMods(param1:AvatarDef, param2:Object, param3:int) : int
      {
         baseColor = uint(param2[param3]) > 0 ? uint(param2[param3]) : param1.mannequinColorLayer1;
         param3++;
         patternColor = uint(param2[param3]) > 0 ? uint(param2[param3]) : param1.mannequinColorLayer2;
         param3++;
         patternDefId = param2[param3] > 0 ? param2[param3] : param1.defPattern;
         param3++;
         eyeColor = uint(param2[param3]) > 0 ? uint(param2[param3]) : param1.mannequinColorLayer3;
         param3++;
         eyeDefId = param2[param3] > 0 ? param2[param3] : param1.defEyes;
         return ++param3;
      }

      private function setupDataInvIdsOnly(param1:AvatarDef, param2:Object, param3:int) : int
      {
         param3 = setupBodMods(param1,param2,param3);
         tailInvId = param2[param3++];
         legInvId = param2[param3++];
         backInvId = param2[param3++];
         neckInvId = param2[param3++];
         headInvId = param2[param3++];
         piecesFromSlots();
         setupMannequinInventory();
         return param3;
      }

      private function setupDataFull(param1:AvatarDef, param2:Object, param3:int) : int
      {
         param3 = setupBodMods(param1,param2,param3);
         tailDefId = param2[param3++];
         tailColor = tailDefId > 0 ? param2[param3++] : 0;
         tailInvId = tailDefId > 0 ? param2[param3++] : 0;
         legDefId = param2[param3++];
         legColor = legDefId > 0 ? param2[param3++] : 0;
         legInvId = legDefId > 0 ? param2[param3++] : 0;
         backDefId = param2[param3++];
         backColor = backDefId > 0 ? param2[param3++] : 0;
         backInvId = backDefId > 0 ? param2[param3++] : 0;
         neckDefId = param2[param3++];
         neckColor = neckDefId > 0 ? param2[param3++] : 0;
         neckInvId = neckDefId > 0 ? param2[param3++] : 0;
         headDefId = param2[param3++];
         headColor = headDefId > 0 ? param2[param3++] : 0;
         headInvId = headDefId > 0 ? param2[param3++] : 0;
         piecesFromSlots();
         // a visitor's own inventory has nothing to do with the owner's
         if(_isMyItem)
         {
            setupMannequinInventory();
         }
         return param3;
      }

      private function onMannequinAvatarViewLoaded(param1:int) : void
      {
         if(_mannaquinLoadingSpiral != null)
         {
            _mannaquinLoadingSpiral.destroy();
            _mannaquinLoadingSpiral = null;
         }
         if(_mannequinAvatarView)
         {
            if(_viewContainer)
            {
               _mannequinAvatarView.pauseAnim(true);
               _viewContainer.avatarBox.addChild(_mannequinAvatarView);
               if(_refreshAvatarView)
               {
                  recreateAvatarForView();
               }
            }
         }
         _isLoading = false;
         _refreshAvatarView = false;
      }

      private function recreateAvatarForView() : void
      {
         var _loc1_:Avatar = new Avatar();
         _loc1_.avName = _denDef.name;
         _loc1_.init(-1,-1,_loc1_.avName,_denDef.mannequinAvatarDefId,[baseColor,patternColor,eyeColor],-1,null,"",-1,AvatarManager.roomEnviroType,null,null,null,null,null,true);
         if(RoomManagerWorld.instance.isMyDen || _isMyItem)
         {
            _loc1_.userName = gMainFrame.userInfo.myUserName;
            _loc1_.avInvId = gMainFrame.userInfo.playerAvatarInfo.avInvId;
            _loc1_.itemResponseIntegrate(generateBodModsAndClothingList(true));
         }
         else
         {
            _loc1_.itemResponseIntegrate(generateBodModsAndClothingList(false));
         }
         if(_mannequinAvatarView)
         {
            _mannequinAvatarView.setLayerOrder(layerOrder);
            _mannequinAvatarView.resetAvatar(_loc1_);
         }
      }

      private function generateBodModsAndClothingList(param1:Boolean) : AccItemCollection
      {
         var _loc6_:Item = null;
         var _loc2_:AccItemCollection = null;
         var _loc3_:int = 0;
         var _loc4_:AccItemCollection = ItemXtCommManager.generateBodyModList(0,patternDefId,eyeDefId,false);
         var _loc5_:AccItemCollection = new AccItemCollection();
         if(param1)
         {
            _loc2_ = gMainFrame.userInfo.playerAvatarInfo.getFullItems();
            _loc3_ = 0;
            while(_loc3_ < _loc2_.length)
            {
               if(_loc2_.getAccItem(_loc3_).enviroType == AvatarManager.roomEnviroType || _loc2_.getAccItem(_loc3_).isLandAndOcean)
               {
                  _loc6_ = _loc2_.getAccItem(_loc3_).clone() as Item;
                  _loc6_.forceInUse(true);
                  if(hasPiece(_loc6_.invIdx))
                  {
                     _loc6_.setInUse(0,true);
                  }
                  else
                  {
                     _loc6_.setInUse(0,false);
                  }
                  _loc5_.pushAccItem(_loc6_);
               }
               _loc3_++;
            }
         }
         else
         {
            // a visitor sees each piece by its def and colour
            _loc3_ = 0;
            while(_loc3_ < pieces.length)
            {
               if(int(pieces[_loc3_].d) != 0)
               {
                  _loc6_ = new Item();
                  _loc6_.init(int(pieces[_loc3_].d),int(pieces[_loc3_].i) > 0 ? int(pieces[_loc3_].i) : _loc3_ + 1,uint(pieces[_loc3_].c));
                  _loc6_.forceInUse(true);
                  _loc6_.setInUse(0,true);
                  _loc5_.pushAccItem(_loc6_);
               }
               _loc3_++;
            }
         }
         return new AccItemCollection(_loc5_.concatCollection(_loc4_));
      }

      private function setupMannequinInventory() : void
      {
         var _loc1_:Object = null;
         for each(_loc1_ in pieces)
         {
            DenMannequinInventory.setItemInUse(int(_loc1_.i),invIdx);
         }
      }
   }
}

