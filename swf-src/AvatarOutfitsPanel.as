package gui
{
   import flash.display.DisplayObjectContainer;
   import flash.display.Graphics;
   import flash.display.Shape;
   import flash.display.Sprite;
   import flash.events.MouseEvent;
   import flash.geom.Rectangle;
   import flash.text.TextField;
   import item.Item;

   // the avatar editor's outfits window (this server): the player's saved
   // outfits ("!outfit save" or the button below), each with the icons of
   // its pieces. "Wear" puts one on the animal in the editor (or the
   // mannequin) as if its pieces were picked there, in the outfit's layer
   // order, and the editor saves it on closing as ever; "Save what I wear"
   // keeps what the editor shows under a name; the cross deletes one. the
   // list comes from the server (lib/commands.js: "xol", "xos", "xod").
   // drawn as the layers panel next to it is (DenUi).
   public class AvatarOutfitsPanel extends Sprite
   {
      private static const HEAD:Number = 36;
      private static const HINT:Number = 15;
      private static const ROW:Number = 50;
      private static const FOOT:Number = 38;
      private static const INSET:Number = 7;
      private static const ICON:Number = 22;
      private static const SCROLL_W:Number = 8;

      // the one open, which the server's "xol" goes to
      private static var _shown:AvatarOutfitsPanel;

      // (pieces [{d, c, i}], ordered) -> how many could not be put on
      private var _wear:Function;
      // () -> {pieces: [{i}], ordered}: what the editor shows, the bottom first
      private var _current:Function;
      // () -> where the name box goes (over the whole game)
      private var _promptLayer:Function;
      private var _onClose:Function;

      private var _w:Number;
      private var _h:Number;
      private var _listX:Number;
      private var _listY:Number;
      private var _listW:Number;
      private var _listH:Number;

      private var _frame:Shape;
      private var _countTxt:TextField;
      private var _hintTxt:TextField;
      private var _list:Sprite;
      private var _listMask:Shape;
      private var _scrollThumb:Shape;
      private var _emptyTxt:TextField;
      private var _saveBtn:Sprite;

      // {name, ordered, pieces: [{d, c, i}]}; null until the server answers
      private var _outfits:Array;
      private var _rows:Array;
      private var _icons:Array;
      private var _scroll:Number = 0;
      // the outfit put on last, ringed
      private var _worn:String;
      // the name just sent to be saved, until the list comes back
      private var _saving:String;

      public function AvatarOutfitsPanel(param1:Function, param2:Function, param3:Function, param4:Function)
      {
         super();
         _wear = param1;
         _current = param2;
         _promptLayer = param3;
         _onClose = param4;
         _rows = [];
         _icons = [];
         visible = false;
         addEventListener("mouseDown",DenUi.stop,false,0,true);
         addEventListener("click",DenUi.stop,false,0,true);
         addEventListener("mouseWheel",onWheel,false,0,true);
      }

      // "xol" from the server: [xol, -1, count, (name, ordered, pieceCount, (def, colour, inv)...)...]
      public static function onList(param1:Object) : void
      {
         if(_shown != null)
         {
            _shown.takeList(param1);
         }
      }

      public function destroy() : void
      {
         visible = false;
         if(_shown == this)
         {
            _shown = null;
         }
         clearRows();
         if(parent)
         {
            parent.removeChild(this);
         }
      }

      public function open(param1:Rectangle) : void
      {
         x = Math.round(param1.x);
         y = Math.round(param1.y);
         if(_frame == null || _w != Math.round(param1.width) || _h != Math.round(param1.height))
         {
            _w = Math.round(param1.width);
            _h = Math.round(param1.height);
            build();
         }
         visible = true;
         _shown = this;
         _scroll = 0;
         setHint("Wear one to try it on. Close the editor to keep it.");
         if(_outfits == null)
         {
            drawRows();
         }
         gMainFrame.server.setXtObject_Str("xol",[0]);
      }

      public function close() : void
      {
         visible = false;
         if(_shown == this)
         {
            _shown = null;
         }
      }

      public function get isOpen() : Boolean
      {
         return visible;
      }

      // ---- building ----

      private function build() : void
      {
         while(numChildren > 0)
         {
            removeChildAt(0);
         }
         _listX = INSET + 5;
         _listY = HEAD + HINT;
         _listW = _w - INSET * 2 - 10 - SCROLL_W - 3;
         _listH = _h - _listY - FOOT - INSET;
         _frame = new Shape();
         addChild(_frame);
         var _loc1_:Graphics = _frame.graphics;
         DenUi.woodBox(_loc1_,_w,_h,INSET);
         DenUi.titleStrip(_loc1_,8,6,_w - 42,24);
         _loc1_.lineStyle(1,0xB89B5E);
         _loc1_.beginFill(DenUi.CREAM_LIGHT,0.55);
         _loc1_.drawRoundRect(_listX - 3,_listY - 3,_listW + SCROLL_W + 9,_listH + 6,10,10);
         _loc1_.endFill();
         _loc1_.lineStyle();
         var _loc2_:TextField = DenUi.title("Outfits",15);
         _loc2_.x = 18;
         _loc2_.y = 8;
         _loc2_.mouseEnabled = false;
         addChild(_loc2_);
         _countTxt = DenUi.text("",11,DenUi.TEXT);
         _countTxt.mouseEnabled = false;
         _countTxt.x = _loc2_.x + _loc2_.width + 6;
         _countTxt.y = 11;
         addChild(_countTxt);
         var _loc3_:Sprite = DenUi.roundButton(11,DenUi.drawCross,onCloseBtn);
         _loc3_.x = _w - 20;
         _loc3_.y = 18;
         addChild(_loc3_);
         _hintTxt = DenUi.text("",10,DenUi.TEXT_SOFT);
         _hintTxt.mouseEnabled = false;
         _hintTxt.x = _listX;
         _hintTxt.y = HEAD - 3;
         addChild(_hintTxt);
         _list = new Sprite();
         _list.x = _listX;
         _list.y = _listY;
         addChild(_list);
         _listMask = new Shape();
         _listMask.graphics.beginFill(0);
         _listMask.graphics.drawRect(_listX - 2,_listY,_listW + 4,_listH);
         _listMask.graphics.endFill();
         addChild(_listMask);
         _list.mask = _listMask;
         _scrollThumb = new Shape();
         _scrollThumb.x = _listX + _listW + 4;
         addChild(_scrollThumb);
         _emptyTxt = DenUi.text("",12,DenUi.TEXT_SOFT);
         _emptyTxt.mouseEnabled = false;
         addChild(_emptyTxt);
         _saveBtn = DenUi.greenPill("Save what I wear",Math.min(160,_w - 40),onSave,24);
         _saveBtn.x = Math.round((_w - _saveBtn.width) * 0.5);
         _saveBtn.y = _h - INSET - FOOT + 8;
         addChild(_saveBtn);
         _rows = [];
      }

      private function setHint(param1:String) : void
      {
         if(_hintTxt)
         {
            DenUi.fitText(_hintTxt,param1,_listW + SCROLL_W);
         }
      }

      // ---- the model ----

      private function takeList(param1:Object) : void
      {
         var _loc2_:Array = [];
         var _loc3_:int = 3;
         var _loc4_:int = int(param1[2]);
         var _loc5_:int = 0;
         while(_loc5_ < _loc4_ && _loc3_ + 2 < param1.length)
         {
            var _loc6_:Object = {
               "name":String(param1[_loc3_]),
               "ordered":int(param1[_loc3_ + 1]) == 1,
               "pieces":[]
            };
            var _loc7_:int = int(param1[_loc3_ + 2]);
            _loc3_ += 3;
            var _loc8_:int = 0;
            while(_loc8_ < _loc7_ && _loc3_ + 2 < param1.length)
            {
               _loc6_.pieces.push({
                  "d":int(param1[_loc3_]),
                  "c":uint(param1[_loc3_ + 1]),
                  "i":int(param1[_loc3_ + 2])
               });
               _loc3_ += 3;
               _loc8_++;
            }
            _loc2_.push(_loc6_);
            _loc5_++;
         }
         _outfits = _loc2_;
         if(_saving != null)
         {
            // the server says no (in a box of its own) by leaving it out
            if(named(_saving) != null)
            {
               _worn = _saving;
               setHint("Saved " + _saving + ".");
            }
            else
            {
               setHint("It was not saved.");
            }
            _saving = null;
         }
         drawRows();
      }

      private function wear(param1:Object) : void
      {
         var _loc2_:int = int(_wear(param1.pieces,param1.ordered));
         _worn = param1.name;
         drawRows();
         if(param1.pieces.length == 0)
         {
            setHint("None of its pieces are yours any more.");
         }
         else if(_loc2_ > 0)
         {
            setHint(_loc2_ == 1 ? "1 piece could not be put on." : _loc2_ + " pieces could not be put on.");
         }
         else
         {
            setHint("Wearing " + param1.name + ". Close the editor to keep it.");
         }
      }

      private function nextName() : String
      {
         var _loc1_:int = 1;
         while(named("outfit" + _loc1_) != null)
         {
            _loc1_++;
         }
         return "outfit" + _loc1_;
      }

      private function named(param1:String) : Object
      {
         for each(var _loc2_:Object in _outfits)
         {
            if(_loc2_.name == param1)
            {
               return _loc2_;
            }
         }
         return null;
      }

      private function onSave() : void
      {
         var _loc1_:DisplayObjectContainer = _promptLayer() as DisplayObjectContainer;
         if(_loc1_ == null)
         {
            return;
         }
         DenUi.prompt(_loc1_,"Save outfit","A name of letters and digits. Saving under a name you already have replaces that outfit.",nextName(),[["Save","green",save],["Cancel","red",null]],20);
      }

      private function save(param1:String) : void
      {
         var _loc2_:String = String(param1).toLowerCase().replace(/[^a-z0-9]/g,"").substr(0,20);
         if(_loc2_.length == 0)
         {
            setHint("Give it a name of letters and digits.");
            return;
         }
         var _loc3_:Object = _current();
         var _loc4_:Array = _loc3_ != null && _loc3_.pieces != null ? _loc3_.pieces : [];
         var _loc5_:Array = [_loc2_,_loc3_ != null && _loc3_.ordered ? 1 : 0,_loc4_.length];
         for each(var _loc6_:Object in _loc4_)
         {
            _loc5_.push(int(_loc6_.i));
         }
         gMainFrame.server.setXtObject_Str("xos",_loc5_);
         _saving = _loc2_;
         setHint("Saving " + _loc2_ + "...");
      }

      private function onDelete(param1:Object) : void
      {
         var _loc2_:DisplayObjectContainer = _promptLayer() as DisplayObjectContainer;
         if(_loc2_ == null)
         {
            return;
         }
         DenUi.prompt(_loc2_,"Delete outfit","Delete " + param1.name + "? Its clothes stay yours.",null,[["Delete","red",function(param2:String):void
         {
            gMainFrame.server.setXtObject_Str("xod",[param1.name]);
         }],["Keep","green",null]]);
      }

      private function onCloseBtn() : void
      {
         close();
         if(_onClose != null)
         {
            _onClose();
         }
      }

      // ---- drawing ----

      private function clearRows() : void
      {
         for each(var _loc1_:Sprite in _rows)
         {
            if(_loc1_.parent)
            {
               _loc1_.parent.removeChild(_loc1_);
            }
         }
         _rows = [];
         for each(var _loc2_:Item in _icons)
         {
            try
            {
               _loc2_.imageLoadedCallback = null;
               _loc2_.destroy();
            }
            catch(e:Error)
            {
            }
         }
         _icons = [];
      }

      private function drawRows() : void
      {
         clearRows();
         var _loc1_:Array = _outfits != null ? _outfits : [];
         var _loc2_:int = 0;
         while(_loc2_ < _loc1_.length)
         {
            var _loc3_:Sprite = makeRow(_loc1_[_loc2_],_loc2_);
            _list.addChild(_loc3_);
            _rows.push(_loc3_);
            _loc2_++;
         }
         _countTxt.text = _loc1_.length > 0 ? String(_loc1_.length) : "";
         _emptyTxt.visible = _loc1_.length == 0;
         if(_emptyTxt.visible)
         {
            DenUi.fitText(_emptyTxt,_outfits == null ? "Loading..." : "No outfits yet. Save what you wear!",_listW - 10);
            _emptyTxt.x = Math.round(_listX + (_listW - _emptyTxt.width) * 0.5);
            _emptyTxt.y = Math.round(_listY + 20);
         }
         clampScroll();
         placeRows();
      }

      private function makeRow(param1:Object, param2:int) : Sprite
      {
         var _loc3_:Sprite = new Sprite();
         var _loc4_:Graphics = _loc3_.graphics;
         _loc4_.beginFill((param2 & 1) ? 0xF1E2B8 : 0xF7EDCF);
         _loc4_.drawRoundRect(0,0,_listW,ROW - 2,8,8);
         _loc4_.endFill();
         if(param1.name == _worn)
         {
            _loc4_.lineStyle(2,DenUi.GOLD_DARK);
            _loc4_.drawRoundRect(1,1,_listW - 2,ROW - 4,8,8);
            _loc4_.lineStyle();
         }
         var _loc5_:Number = _listW - 92;
         var _loc6_:TextField = DenUi.text("",12,DenUi.TEXT);
         _loc6_.mouseEnabled = false;
         DenUi.fitText(_loc6_,param1.name + (param1.ordered ? "  (layered)" : ""),_loc5_);
         _loc6_.x = 6;
         _loc6_.y = 0;
         _loc3_.addChild(_loc6_);
         // the pieces' icons, as many as fit, then how many more
         var _loc7_:int = Math.max(1,int((_loc5_ - 22) / (ICON + 4)));
         var _loc8_:int = 0;
         while(_loc8_ < param1.pieces.length && _loc8_ < _loc7_)
         {
            var _loc9_:Number = 6 + _loc8_ * (ICON + 4);
            _loc4_.lineStyle(1,0xC9A86A);
            _loc4_.beginFill(0xFFFBEA);
            _loc4_.drawRoundRect(_loc9_,20,ICON + 2,ICON + 2,7,7);
            _loc4_.endFill();
            _loc4_.lineStyle();
            _loc3_.addChild(iconOf(param1.pieces[_loc8_],_loc9_ + 1 + ICON * 0.5,21 + ICON * 0.5));
            _loc8_++;
         }
         if(param1.pieces.length > _loc7_)
         {
            var _loc10_:TextField = DenUi.text("+" + (param1.pieces.length - _loc7_),11,DenUi.TEXT_SOFT);
            _loc10_.mouseEnabled = false;
            _loc10_.x = 6 + _loc7_ * (ICON + 4);
            _loc10_.y = 24;
            _loc3_.addChild(_loc10_);
         }
         if(param1.pieces.length == 0)
         {
            var _loc11_:TextField = DenUi.text("nothing",10,DenUi.TEXT_SOFT);
            _loc11_.mouseEnabled = false;
            _loc11_.x = 6;
            _loc11_.y = 24;
            _loc3_.addChild(_loc11_);
         }
         var _loc12_:Sprite = DenUi.greenPill("Wear",56,function():void
         {
            wear(param1);
         },24);
         _loc12_.x = _listW - 86;
         _loc12_.y = Math.round((ROW - 2 - 24) * 0.5);
         _loc3_.addChild(_loc12_);
         var _loc13_:Sprite = DenUi.roundButton(9,DenUi.drawCross,function():void
         {
            onDelete(param1);
         });
         _loc13_.x = _listW - 14;
         _loc13_.y = ROW * 0.5 - 1;
         _loc3_.addChild(_loc13_);
         return _loc3_;
      }

      // one piece's icon, fitted in an ICON box around (param2, param3) once loaded
      private function iconOf(param1:Object, param2:Number, param3:Number) : Sprite
      {
         var _loc4_:Sprite = new Sprite();
         _loc4_.mouseEnabled = false;
         _loc4_.mouseChildren = false;
         var _loc5_:Item = new Item();
         _loc5_.init(int(param1.d),int(param1.i),uint(param1.c));
         _icons.push(_loc5_);
         _loc5_.imageLoadedCallback = function():void
         {
            fitIcon(_loc4_,param2,param3);
         };
         if(_loc5_.icon != null)
         {
            _loc4_.addChild(_loc5_.icon);
         }
         fitIcon(_loc4_,param2,param3);
         return _loc4_;
      }

      private function fitIcon(param1:Sprite, param2:Number, param3:Number) : void
      {
         param1.scaleX = param1.scaleY = 1;
         var _loc4_:Rectangle = param1.getBounds(param1);
         if(_loc4_.width < 1 || _loc4_.height < 1)
         {
            param1.x = param2;
            param1.y = param3;
            return;
         }
         var _loc5_:Number = ICON / Math.max(_loc4_.width,_loc4_.height);
         param1.scaleX = param1.scaleY = _loc5_;
         param1.x = param2 - (_loc4_.x + _loc4_.width * 0.5) * _loc5_;
         param1.y = param3 - (_loc4_.y + _loc4_.height * 0.5) * _loc5_;
      }

      private function clampScroll() : void
      {
         _scroll = Math.max(0,Math.min(_scroll,_rows.length * ROW - _listH));
      }

      private function placeRows() : void
      {
         var _loc1_:int = 0;
         while(_loc1_ < _rows.length)
         {
            Sprite(_rows[_loc1_]).y = _loc1_ * ROW - _scroll;
            _loc1_++;
         }
         var _loc2_:Number = _rows.length * ROW;
         var _loc3_:Graphics = _scrollThumb.graphics;
         _loc3_.clear();
         _scrollThumb.visible = _loc2_ > _listH;
         if(!_scrollThumb.visible)
         {
            return;
         }
         var _loc4_:Number = Math.max(24,_listH * _listH / _loc2_);
         _scrollThumb.y = _listY + (_listH - _loc4_) * _scroll / (_loc2_ - _listH);
         _loc3_.lineStyle(1,DenUi.WOOD_DARK);
         _loc3_.beginFill(DenUi.WOOD_LIGHT);
         _loc3_.drawRoundRect(0,0,SCROLL_W,_loc4_,8,8);
         _loc3_.endFill();
      }

      private function onWheel(param1:MouseEvent) : void
      {
         param1.stopPropagation();
         _scroll -= param1.delta * 12;
         clampScroll();
         placeRows();
      }
   }
}
