package gui
{
   import avatar.AvatarEditorView;
   import flash.display.DisplayObject;
   import flash.display.Graphics;
   import flash.display.Shape;
   import flash.display.Sprite;
   import flash.events.Event;
   import flash.events.MouseEvent;
   import flash.filters.DropShadowFilter;
   import flash.geom.Point;
   import flash.geom.Rectangle;
   import flash.text.TextField;
   import item.Item;

   // the avatar editor's layers panel (this server): the clothes the animal
   // in the editor wears, the piece worn in front at the top, each with its
   // icon, its name and where it goes (head, neck ...). a row is dragged
   // up or down, or moved one place with its arrows, to wear it in front of
   // or behind the others; "Default" gives the game's own order back. the
   // animal in the editor shows each change at once; the editor saves the
   // order when it closes (AvatarEditor, AvatarUtility.sendLayerOrder), and
   // everyone sees it. drawn as the den editor's layers panel is (DenUi).
   public class AvatarLayersPanel extends Sprite
   {
      private static const HEAD:Number = 36;
      private static const HINT:Number = 15;
      private static const ROW:Number = 32;
      private static const FOOT:Number = 38;
      private static const INSET:Number = 7;
      private static const ICON:Number = 26;
      private static const SCROLL_W:Number = 8;

      // () -> the editor's AvatarEditorView (made anew now and then)
      private var _view:Function;
      // (): the order now, null for the game's; (order or null): a new one
      private var _getOrder:Function;
      private var _setOrder:Function;
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
      private var _dropLine:Shape;
      private var _scrollThumb:Sprite;
      private var _emptyTxt:TextField;
      private var _defaultBtn:Sprite;

      // what the list shows, front first: {item, d, i, s, key}
      private var _entries:Array;
      private var _rows:Array;
      private var _signature:String = "";
      private var _scroll:Number = 0;
      // the piece moved last, ringed (its key)
      private var _moved:String;
      // key -> {clone: Item, holder: Sprite}: each piece's own icon
      private var _icons:Object;

      private var _down:int = -1;
      private var _downPoint:Point;
      private var _dragging:Boolean;
      private var _dropGap:int = -1;
      private var _thumbDrag:Number = -1;

      public function AvatarLayersPanel(param1:Function, param2:Function, param3:Function, param4:Function)
      {
         super();
         _view = param1;
         _getOrder = param2;
         _setOrder = param3;
         _onClose = param4;
         _entries = [];
         _rows = [];
         _icons = {};
         visible = false;
         addEventListener("mouseDown",DenUi.stop,false,0,true);
         addEventListener("click",DenUi.stop,false,0,true);
         addEventListener("mouseWheel",onWheel,false,0,true);
         addEventListener("enterFrame",onFrame,false,0,true);
      }

      public function destroy() : void
      {
         visible = false;
         endPress();
         removeEventListener("enterFrame",onFrame);
         if(parent)
         {
            parent.removeChild(this);
         }
         for each(var _loc1_:Object in _icons)
         {
            try
            {
               Item(_loc1_.clone).imageLoadedCallback = null;
               Item(_loc1_.clone).destroy();
            }
            catch(e:Error)
            {
            }
         }
         _icons = {};
         _rows = [];
         _entries = [];
      }

      // the panel takes the place `param1` gives (in its parent's space)
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
         _signature = "";
         _scroll = 0;
         _moved = null;
         refresh();
      }

      public function close() : void
      {
         endPress();
         visible = false;
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
         // the list's own inset, a little darker
         _loc1_.lineStyle(1,0xB89B5E);
         _loc1_.beginFill(DenUi.CREAM_LIGHT,0.55);
         _loc1_.drawRoundRect(_listX - 3,_listY - 3,_listW + SCROLL_W + 9,_listH + 6,10,10);
         _loc1_.endFill();
         _loc1_.lineStyle();
         var _loc2_:TextField = DenUi.title("Layers",15);
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
         DenUi.fitText(_hintTxt,"Drag, or use the arrows. Top is in front.",_listW + SCROLL_W);
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
         _dropLine = new Shape();
         _dropLine.visible = false;
         addChild(_dropLine);
         _scrollThumb = new Sprite();
         _scrollThumb.buttonMode = true;
         _scrollThumb.x = _listX + _listW + 4;
         _scrollThumb.addEventListener("mouseDown",onThumbDown,false,0,true);
         addChild(_scrollThumb);
         _emptyTxt = DenUi.text("",12,DenUi.TEXT_SOFT);
         _emptyTxt.mouseEnabled = false;
         addChild(_emptyTxt);
         _defaultBtn = DenUi.goldPill("Default order",Math.min(130,_w - 40),onDefault,24);
         _defaultBtn.x = Math.round((_w - _defaultBtn.width) * 0.5);
         _defaultBtn.y = _h - INSET - FOOT + 8;
         addChild(_defaultBtn);
         _rows = [];
      }

      // ---- the model ----

      // the pieces the editor's animal wears, in the order they are painted
      // (the layers its view was last given: AvatarView.currentLayers), the
      // front one first
      private function wornEntries() : Array
      {
         var _loc1_:AvatarEditorView = _view != null ? _view() as AvatarEditorView : null;
         var _loc2_:Array = _loc1_ != null ? _loc1_.currentLayers : null;
         var _loc3_:Array = [];
         if(_loc2_ == null || _loc1_.viewAvatar == null)
         {
            return _loc3_;
         }
         var _loc4_:Array = _loc1_.viewAvatar.accShownItemsWithoutBodMods.getCoreArray();
         var _loc9_:Array = [];
         var _loc5_:int = 0;
         while(_loc5_ < _loc2_.length)
         {
            var _loc6_:Object = _loc2_[_loc5_];
            if(int(_loc6_.s) > 3)
            {
               // the very piece, or failing that one of the same def not
               // listed yet (LayerAnim keeps the layers it had when only
               // another copy of a piece took its place)
               var _loc7_:Item = null;
               for each(var _loc8_:Item in _loc4_)
               {
                  if(_loc8_.defId == int(_loc6_.d) && _loc8_.invIdx == int(_loc6_.i) && _loc9_.indexOf(_loc8_) < 0)
                  {
                     _loc7_ = _loc8_;
                     break;
                  }
               }
               if(_loc7_ == null)
               {
                  for each(_loc8_ in _loc4_)
                  {
                     if(_loc8_.defId == int(_loc6_.d) && _loc9_.indexOf(_loc8_) < 0)
                     {
                        _loc7_ = _loc8_;
                        break;
                     }
                  }
               }
               if(_loc7_ != null)
               {
                  _loc9_.push(_loc7_);
                  _loc3_.push({
                     "item":_loc7_,
                     "d":int(_loc6_.d),
                     "i":_loc7_.invIdx,
                     "s":int(_loc6_.s),
                     "z":(_loc6_.hasOwnProperty("z") ? int(_loc6_.z) : -1),
                     "p":_loc5_,
                     "key":_loc7_.defId + "|" + _loc7_.invIdx + "|" + _loc7_.color
                  });
               }
            }
            _loc5_++;
         }
         // as LayerBitmap paints them: by rank, else by slot and then as listed
         _loc3_.sort(function(param1:Object, param2:Object):int
         {
            if(param1.z >= 0 && param2.z >= 0)
            {
               return param1.z - param2.z;
            }
            if(param1.s != param2.s)
            {
               return param1.s - param2.s;
            }
            return param1.p - param2.p;
         });
         return _loc3_.reverse();
      }

      private function onFrame(param1:Event) : void
      {
         if(!visible || _dragging || _thumbDrag >= 0)
         {
            return;
         }
         refresh();
      }

      // the list again, when what is worn (or its order) is not what it shows
      private function refresh() : void
      {
         var _loc1_:Array = wornEntries();
         var _loc2_:Array = [];
         for each(var _loc3_:Object in _loc1_)
         {
            _loc2_.push(_loc3_.key);
         }
         var _loc4_:String = _loc2_.join(",") + (_getOrder() != null ? "|o" : "");
         if(_loc4_ == _signature)
         {
            return;
         }
         _signature = _loc4_;
         _entries = _loc1_;
         drawRows();
      }

      // a new order: the list, bottom first, as the order's {d, i}
      private function apply(param1:Array, param2:String) : void
      {
         var _loc3_:Array = [];
         var _loc4_:int = param1.length - 1;
         while(_loc4_ >= 0)
         {
            _loc3_.push({
               "d":param1[_loc4_].d,
               "i":param1[_loc4_].i
            });
            _loc4_--;
         }
         _moved = param2;
         _setOrder(_loc3_);
         _signature = "";
         refresh();
      }

      private function move(param1:int, param2:int) : void
      {
         if(param1 < 0 || param1 >= _entries.length || param2 < 0 || param2 > _entries.length || param2 == param1 || param2 == param1 + 1)
         {
            return;
         }
         var _loc3_:Array = _entries.concat();
         var _loc4_:Object = _loc3_.splice(param1,1)[0];
         _loc3_.splice(param2 > param1 ? param2 - 1 : param2,0,_loc4_);
         apply(_loc3_,_loc4_.key);
      }

      private function onDefault() : void
      {
         if(_getOrder() == null)
         {
            return;
         }
         _moved = null;
         _setOrder(null);
         _signature = "";
         refresh();
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

      private function drawRows() : void
      {
         for each(var _loc1_:Sprite in _rows)
         {
            _list.removeChild(_loc1_);
         }
         _rows = [];
         var _loc2_:int = 0;
         while(_loc2_ < _entries.length)
         {
            _loc1_ = makeRow(_entries[_loc2_],_loc2_);
            _list.addChild(_loc1_);
            _rows.push(_loc1_);
            _loc2_++;
         }
         _countTxt.text = _entries.length > 0 ? String(_entries.length) : "";
         _emptyTxt.visible = _entries.length == 0;
         if(_emptyTxt.visible)
         {
            DenUi.fitText(_emptyTxt,"Put some clothes on first.",_listW - 10);
            _emptyTxt.x = Math.round(_listX + (_listW - _emptyTxt.width) * 0.5);
            _emptyTxt.y = Math.round(_listY + 20);
         }
         DenUi.setEnabled(_defaultBtn,_getOrder() != null);
         clampScroll();
         placeRows();
      }

      private function makeRow(param1:Object, param2:int) : Sprite
      {
         var _loc3_:Sprite = new Sprite();
         var _loc4_:Graphics = _loc3_.graphics;
         var _loc5_:Boolean = param1.key == _moved;
         _loc4_.beginFill((param2 & 1) ? 0xF1E2B8 : 0xF7EDCF);
         _loc4_.drawRoundRect(0,0,_listW,ROW - 2,8,8);
         _loc4_.endFill();
         if(_loc5_)
         {
            _loc4_.lineStyle(2,DenUi.GOLD_DARK);
            _loc4_.drawRoundRect(1,1,_listW - 2,ROW - 4,8,8);
            _loc4_.lineStyle();
         }
         // a little grip on the left: it can be dragged
         _loc4_.beginFill(0xB89B5E);
         var _loc6_:int = 0;
         while(_loc6_ < 3)
         {
            _loc4_.drawCircle(6,9 + _loc6_ * 5.5,1.3);
            _loc4_.drawCircle(10,9 + _loc6_ * 5.5,1.3);
            _loc6_++;
         }
         _loc4_.endFill();
         // the icon in a cream box, as the game shows items
         _loc4_.lineStyle(1,0xC9A86A);
         _loc4_.beginFill(0xFFFBEA);
         _loc4_.drawRoundRect(15,1,ICON + 2,ICON + 2,8,8);
         _loc4_.endFill();
         _loc4_.lineStyle();
         _loc3_.addChild(iconOf(param1.item,param1.key,16 + ICON * 0.5,2 + ICON * 0.5));
         var _loc7_:Number = 15 + ICON + 8;
         var _loc8_:Number = _listW - _loc7_ - 50;
         var _loc9_:TextField = DenUi.text("",12,DenUi.TEXT);
         _loc9_.mouseEnabled = false;
         DenUi.fitText(_loc9_,Item(param1.item).name,_loc8_);
         _loc9_.x = _loc7_;
         _loc9_.y = 0;
         _loc3_.addChild(_loc9_);
         var _loc10_:String = Item(param1.item).sortIdString;
         var _loc11_:TextField = DenUi.text("",10,DenUi.TEXT_SOFT);
         _loc11_.mouseEnabled = false;
         DenUi.fitText(_loc11_,_loc10_.length > 0 ? _loc10_.charAt(0).toUpperCase() + _loc10_.substr(1) : "",_loc8_);
         _loc11_.x = _loc7_;
         _loc11_.y = 14;
         _loc3_.addChild(_loc11_);
         var _loc12_:Sprite = DenUi.roundButton(9,drawUp,function():void
         {
            move(param2,param2 - 1);
         });
         _loc12_.x = _listW - 34;
         _loc12_.y = ROW * 0.5 - 1;
         DenUi.setEnabled(_loc12_,param2 > 0);
         _loc3_.addChild(_loc12_);
         var _loc13_:Sprite = DenUi.roundButton(9,drawDown,function():void
         {
            move(param2,param2 + 2);
         });
         _loc13_.x = _listW - 12;
         _loc13_.y = ROW * 0.5 - 1;
         DenUi.setEnabled(_loc13_,param2 < _entries.length - 1);
         _loc3_.addChild(_loc13_);
         _loc3_.addEventListener("mouseDown",function(param1:MouseEvent):void
         {
            onRowDown(param1,param2);
         },false,0,false);
         return _loc3_;
      }

      private function drawUp(param1:Graphics, param2:Number) : void
      {
         param1.beginFill(0xFFFFFF);
         param1.moveTo(-4,2.5);
         param1.lineTo(4,2.5);
         param1.lineTo(0,-3);
         param1.lineTo(-4,2.5);
         param1.endFill();
      }

      private function drawDown(param1:Graphics, param2:Number) : void
      {
         param1.beginFill(0xFFFFFF);
         param1.moveTo(-4,-2.5);
         param1.lineTo(4,-2.5);
         param1.lineTo(0,3);
         param1.lineTo(-4,-2.5);
         param1.endFill();
      }

      // a piece's own icon (an Item of its own: the inventory's icons are in
      // the inventory), fitted in an ICON box around (param3, param4) once
      // it has loaded
      private function iconOf(param1:Item, param2:String, param3:Number, param4:Number) : Sprite
      {
         var _loc5_:Object = _icons[param2];
         if(_loc5_ == null)
         {
            var _loc6_:Item = param1.clone() as Item;
            var _loc7_:Sprite = new Sprite();
            _loc7_.mouseEnabled = false;
            _loc7_.mouseChildren = false;
            _loc5_ = {
               "clone":_loc6_,
               "holder":_loc7_,
               "fitted":false
            };
            _icons[param2] = _loc5_;
            var _loc8_:Object = _loc5_;
            _loc6_.imageLoadedCallback = function():void
            {
               fitIcon(_loc8_);
            };
            _loc7_.addChild(_loc6_.icon);
         }
         _loc5_.cx = param3;
         _loc5_.cy = param4;
         fitIcon(_loc5_);
         return _loc5_.holder;
      }

      private function fitIcon(param1:Object) : void
      {
         var _loc2_:Sprite = param1.holder;
         _loc2_.scaleX = _loc2_.scaleY = 1;
         var _loc3_:Rectangle = _loc2_.getBounds(_loc2_);
         if(_loc3_.width < 1 || _loc3_.height < 1)
         {
            _loc2_.x = param1.cx;
            _loc2_.y = param1.cy;
            return;
         }
         var _loc4_:Number = ICON / Math.max(_loc3_.width,_loc3_.height);
         _loc2_.scaleX = _loc2_.scaleY = _loc4_;
         _loc2_.x = param1.cx - (_loc3_.x + _loc3_.width * 0.5) * _loc4_;
         _loc2_.y = param1.cy - (_loc3_.y + _loc3_.height * 0.5) * _loc4_;
      }

      private function clampScroll() : void
      {
         _scroll = Math.max(0,Math.min(_scroll,_entries.length * ROW - _listH));
      }

      private function placeRows() : void
      {
         var _loc1_:int = 0;
         while(_loc1_ < _rows.length)
         {
            Sprite(_rows[_loc1_]).y = _loc1_ * ROW - _scroll;
            _loc1_++;
         }
         var _loc2_:Number = _entries.length * ROW;
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

      // ---- the pointer ----

      private function onWheel(param1:MouseEvent) : void
      {
         param1.stopPropagation();
         _scroll -= param1.delta * 12;
         clampScroll();
         placeRows();
      }

      private function onThumbDown(param1:MouseEvent) : void
      {
         param1.stopPropagation();
         _thumbDrag = mouseY - _scrollThumb.y;
         beginPress();
      }

      private function onRowDown(param1:MouseEvent, param2:int) : void
      {
         _down = param2;
         _downPoint = new Point(mouseX,mouseY);
         _dragging = false;
         beginPress();
      }

      private function beginPress() : void
      {
         if(stage)
         {
            stage.addEventListener("mouseMove",onStageMove,false,0,true);
            stage.addEventListener("mouseUp",onStageUp,false,0,true);
         }
      }

      private function endPress() : void
      {
         if(stage)
         {
            stage.removeEventListener("mouseMove",onStageMove);
            stage.removeEventListener("mouseUp",onStageUp);
         }
         if(_dragging && _down >= 0 && _down < _rows.length)
         {
            DisplayObject(_rows[_down]).alpha = 1;
            DisplayObject(_rows[_down]).filters = [];
         }
         _down = -1;
         _dragging = false;
         _dropGap = -1;
         _thumbDrag = -1;
         if(_dropLine)
         {
            _dropLine.visible = false;
         }
      }

      private function onStageMove(param1:MouseEvent) : void
      {
         if(_thumbDrag >= 0)
         {
            var _loc2_:Number = _entries.length * ROW - _listH;
            var _loc3_:Number = _listH - _scrollThumb.height;
            if(_loc2_ > 0 && _loc3_ > 0)
            {
               _scroll = (mouseY - _thumbDrag - _listY) / _loc3_ * _loc2_;
               clampScroll();
               placeRows();
            }
            return;
         }
         if(_down < 0)
         {
            return;
         }
         if(!_dragging)
         {
            if(Point.distance(_downPoint,new Point(mouseX,mouseY)) < 5)
            {
               return;
            }
            _dragging = true;
            var _loc4_:Sprite = _rows[_down];
            _list.setChildIndex(_loc4_,_list.numChildren - 1);
            _loc4_.alpha = 0.85;
            _loc4_.filters = [new DropShadowFilter(3,90,0,0.35,6,6)];
         }
         // the row follows the pointer; near the ends the list scrolls
         var _loc5_:Number = mouseY - _listY;
         if(_loc5_ < 10)
         {
            _scroll -= 6;
         }
         else if(_loc5_ > _listH - 10)
         {
            _scroll += 6;
         }
         clampScroll();
         placeRows();
         Sprite(_rows[_down]).y = Math.max(-ROW * 0.5,Math.min(_listH - ROW * 0.5,_loc5_ - ROW * 0.5));
         _dropGap = Math.max(0,Math.min(_entries.length,Math.round((_loc5_ + _scroll) / ROW)));
         var _loc6_:Boolean = _dropGap != _down && _dropGap != _down + 1;
         _dropLine.visible = _loc6_;
         if(_loc6_)
         {
            var _loc7_:Graphics = _dropLine.graphics;
            var _loc8_:Number = Math.max(_listY + 1,Math.min(_listY + _listH - 1,_listY + _dropGap * ROW - _scroll - 1));
            _loc7_.clear();
            _loc7_.lineStyle(3,DenUi.BLUE);
            _loc7_.moveTo(_listX,_loc8_);
            _loc7_.lineTo(_listX + _listW,_loc8_);
            _loc7_.lineStyle();
            _loc7_.beginFill(DenUi.BLUE);
            _loc7_.drawCircle(_listX,_loc8_,4);
            _loc7_.drawCircle(_listX + _listW,_loc8_,4);
            _loc7_.endFill();
         }
      }

      private function onStageUp(param1:MouseEvent) : void
      {
         var _loc2_:int = _down;
         var _loc3_:int = _dropGap;
         var _loc4_:Boolean = _dragging;
         endPress();
         if(_loc4_)
         {
            if(_loc3_ >= 0 && _loc2_ >= 0)
            {
               move(_loc2_,_loc3_);
            }
            placeRows();
         }
      }
   }
}
