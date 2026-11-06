package gui
{
   import currency.UserCurrency;
   import den.DenItem;
   import den.DenXtCommManager;
   import flash.display.DisplayObject;
   import flash.display.DisplayObjectContainer;
   import flash.display.Graphics;
   import flash.display.Shape;
   import flash.display.Sprite;
   import flash.events.Event;
   import flash.events.KeyboardEvent;
   import flash.events.MouseEvent;
   import flash.events.TimerEvent;
   import flash.filters.GlowFilter;
   import flash.text.TextField;
   import flash.text.TextFormat;
   import flash.utils.Timer;

   // the content shop (this server): its own den items (lib/contentpacks.js),
   // opened from the den editor's top right. a game-styled frame laid out
   // like a web shop: collections down the left, a search box, category
   // chips, a page of item cards, a details box, and a cart that is bought
   // all at once. bought items go in the den editor's Custom tab.
   // the server's side is lib/contentshop.js ("dcc", "dcq", "dcb").
   public class DenContentShop
   {
      private static const W:int = 860;
      private static const H:int = 500;
      private static const SIDE_W:int = 186;
      private static const GRID_X:int = 212;
      private static const GRID_Y:int = 116;
      private static const COLS:int = 5;
      private static const ROWS:int = 2;
      private static const CARD_W:int = 120;
      private static const CARD_H:int = 162;
      private static const GAP:int = 7;
      private static const PAGE_SIZE:int = 10;
      private static const MAX_LINES:int = 50;
      private static const MAX_QUANTITY:int = 20;
      private static const ROW_H:int = 22;

      private var _layer:DisplayObjectContainer;
      private var _onBought:Function;
      private var _root:Sprite;
      private var _box:Sprite;
      private var _open:Boolean;

      private var _catalog:Object;
      private var _collection:String = "";
      private var _category:String = "";
      private var _text:String = "";
      private var _page:int;
      private var _pages:int = 1;
      private var _total:int;
      private var _items:Array = [];
      private var _sent:int;
      private var _answered:int;

      // [{id, name, cost, quantity}...]
      private var _cart:Array = [];
      private var _buying:Boolean;
      private var _waitTimer:Timer;

      private var _side:Sprite;
      private var _sideList:Sprite;
      private var _sideMask:Shape;
      private var _chips:Sprite;
      private var _chipsMask:Shape;
      private var _grid:Sprite;
      private var _search:TextField;
      private var _searchHint:TextField;
      private var _searchTimer:Timer;
      private var _gemsTxt:TextField;
      private var _cartBtn:Sprite;
      private var _pageTxt:TextField;
      private var _countTxt:TextField;
      private var _prevBtn:Sprite;
      private var _nextBtn:Sprite;
      private var _status:TextField;
      private var _details:Sprite;
      private var _drawer:Sprite;
      private var _drawerList:Sprite;
      private var _drawerScroll:Number = 0;

      public function DenContentShop(param1:DisplayObjectContainer, param2:Function)
      {
         super();
         _layer = param1;
         _onBought = param2;
      }

      public function get isOpen() : Boolean
      {
         return _open;
      }

      // ---- opening and closing ----

      public function open() : void
      {
         if(_open)
         {
            return;
         }
         _open = true;
         DenXtCommManager.contentCallback = onReply;
         build();
         _layer.addChild(_root);
         if(_catalog == null)
         {
            setStatus("Opening the shop...");
            DenXtCommManager.requestContentCatalog();
            waitForAnswer();
         }
         else
         {
            buildSide();
            buildChips();
            ask(0);
         }
      }

      public function close() : void
      {
         if(!_open)
         {
            return;
         }
         _open = false;
         if(DenXtCommManager.contentCallback == onReply)
         {
            DenXtCommManager.contentCallback = null;
         }
         stopWaiting();
         removeToast();
         if(_searchTimer)
         {
            _searchTimer.stop();
         }
         if(_search && gMainFrame.stage.focus == _search)
         {
            gMainFrame.stage.focus = null;
         }
         if(_root && _root.parent)
         {
            _root.parent.removeChild(_root);
         }
         _root = null;
         _details = null;
         _drawer = null;
      }

      public function destroy() : void
      {
         close();
         _onBought = null;
         _layer = null;
      }

      // ---- the window ----

      private function build() : void
      {
         _root = new Sprite();
         _root.graphics.beginFill(0,0.4);
         _root.graphics.drawRect(0,0,900,550);
         _root.graphics.endFill();
         // nothing past the window reaches the room
         _root.addEventListener("mouseDown",DenUi.stop,false,0,true);
         _root.addEventListener("click",DenUi.stop,false,0,true);
         _root.addEventListener("mouseWheel",DenUi.stop,false,0,true);
         _box = new Sprite();
         _box.x = int((900 - W) * 0.5);
         _box.y = int((550 - H) * 0.5);
         _root.addChild(_box);
         DenUi.woodBox(_box.graphics,W,H);
         DenUi.titleStrip(_box.graphics,14,10,W - 28,28);
         var _loc1_:TextField = DenUi.title(packTitle(),16);
         _loc1_.x = int((W - _loc1_.width) * 0.5);
         _loc1_.y = 13;
         _box.addChild(_loc1_);
         var _loc2_:Sprite = DenUi.roundButton(13,DenUi.drawCross,close);
         _loc2_.x = W - 24;
         _loc2_.y = 24;
         _box.addChild(_loc2_);

         // the left: collections
         _side = new Sprite();
         _side.x = 16;
         _side.y = 48;
         panel(_side.graphics,SIDE_W,H - 64);
         _box.addChild(_side);
         _sideList = new Sprite();
         _sideList.x = 6;
         _sideList.y = 6;
         _side.addChild(_sideList);
         _sideMask = new Shape();
         _sideMask.graphics.beginFill(0);
         _sideMask.graphics.drawRect(0,0,SIDE_W - 12,H - 76);
         _sideMask.graphics.endFill();
         _sideMask.x = 6;
         _sideMask.y = 6;
         _side.addChild(_sideMask);
         _sideList.mask = _sideMask;
         _side.addEventListener("mouseWheel",onSideWheel,false,0,true);

         // the top: search, gems, cart
         var _loc3_:Shape = new Shape();
         _loc3_.graphics.lineStyle(2,0xC9A86A);
         _loc3_.graphics.beginFill(0xFFFFFF);
         _loc3_.graphics.drawRoundRect(GRID_X,48,320,28,16,16);
         _loc3_.graphics.endFill();
         _box.addChild(_loc3_);
         drawMagnifier(_loc3_.graphics,GRID_X + 16,62);
         _search = new TextField();
         _search.type = "input";
         _search.maxChars = 60;
         _search.embedFonts = AJClient.hasGameFont();
         _search.defaultTextFormat = new TextFormat(_search.embedFonts ? "CCDigitalDelivery" : "Arial",14,DenUi.TEXT,true);
         _search.x = GRID_X + 30;
         _search.y = 52;
         _search.width = 284;
         _search.height = 22;
         _search.text = _text;
         _search.addEventListener("change",onSearchChange,false,0,true);
         _search.addEventListener("keyDown",onSearchKey,false,0,true);
         _box.addChild(_search);
         _searchHint = DenUi.text("Search all items...",13,DenUi.TEXT_SOFT,false);
         _searchHint.mouseEnabled = false;
         _searchHint.x = GRID_X + 32;
         _searchHint.y = 53;
         _searchHint.visible = _text == "";
         _box.addChild(_searchHint);
         _gemsTxt = DenUi.text("",13,DenUi.TEXT);
         _box.addChild(_gemsTxt);
         showGems();
         _cartBtn = DenUi.goldPill("Cart",118,toggleDrawer,28);
         _cartBtn.x = W - 136;
         _cartBtn.y = 48;
         _box.addChild(_cartBtn);
         showCartCount();

         // the category chips, scrolled by their arrows
         _chips = new Sprite();
         _chips.x = GRID_X + 28;
         _chips.y = 84;
         _box.addChild(_chips);
         _chipsMask = new Shape();
         _chipsMask.graphics.beginFill(0);
         _chipsMask.graphics.drawRect(0,-2,W - GRID_X - 16 - 56,28);
         _chipsMask.graphics.endFill();
         _chipsMask.x = _chips.x;
         _chipsMask.y = _chips.y;
         _box.addChild(_chipsMask);
         _chips.mask = _chipsMask;
         var _loc4_:Sprite = DenUi.roundButton(11,drawLeft,function():void
         {
            scrollChips(1);
         });
         _loc4_.x = GRID_X + 12;
         _loc4_.y = 96;
         _box.addChild(_loc4_);
         var _loc5_:Sprite = DenUi.roundButton(11,drawRight,function():void
         {
            scrollChips(-1);
         });
         _loc5_.x = W - 28;
         _loc5_.y = 96;
         _box.addChild(_loc5_);

         // the cards, and the pages under them
         _grid = new Sprite();
         _grid.x = GRID_X;
         _grid.y = GRID_Y;
         _box.addChild(_grid);
         _countTxt = DenUi.text("",12,DenUi.TEXT_SOFT);
         _countTxt.x = GRID_X;
         _countTxt.y = H - 38;
         _box.addChild(_countTxt);
         _prevBtn = DenUi.roundButton(12,drawLeft,function():void
         {
            if(_page > 0)
            {
               ask(_page - 1);
            }
         });
         _nextBtn = DenUi.roundButton(12,drawRight,function():void
         {
            if(_page < _pages - 1)
            {
               ask(_page + 1);
            }
         });
         _pageTxt = DenUi.text("",13,DenUi.TEXT);
         _box.addChild(_prevBtn);
         _box.addChild(_nextBtn);
         _box.addChild(_pageTxt);
         _status = DenUi.text("",14,DenUi.TEXT_SOFT);
         _status.mouseEnabled = false;
         _box.addChild(_status);
         showPages();
      }

      private function packTitle() : String
      {
         if(_catalog != null && _catalog.packs && _catalog.packs.length == 1)
         {
            return _catalog.packs[0].name + " Shop";
         }
         return "Custom Content Shop";
      }

      private function panel(param1:Graphics, param2:Number, param3:Number) : void
      {
         param1.lineStyle(1.5,0xB08A50);
         param1.beginFill(DenUi.CREAM_LIGHT);
         param1.drawRoundRect(0,0,param2,param3,14,14);
         param1.endFill();
         param1.lineStyle();
      }

      private function setStatus(param1:String) : void
      {
         if(_status == null)
         {
            return;
         }
         _status.text = param1;
         _status.x = GRID_X + int((W - GRID_X - 16 - _status.width) * 0.5);
         _status.y = GRID_Y + 120;
         _status.visible = param1 != "";
      }

      // ---- the left: collections, by group ----

      private function buildSide() : void
      {
         while(_sideList.numChildren > 0)
         {
            _sideList.removeChildAt(0);
         }
         var _loc1_:Number = 0;
         var _loc2_:int = 0;
         for each(var _loc3_:Object in _catalog.collections)
         {
            _loc2_ += int(_loc3_.count);
         }
         _loc1_ = addSideRow("All items","",-1,_loc1_);
         for each(var _loc4_:String in _catalog.groups)
         {
            var _loc5_:Array = [];
            for each(_loc3_ in _catalog.collections)
            {
               if(_loc3_.group == _loc4_)
               {
                  _loc5_.push(_loc3_);
               }
            }
            if(_loc5_.length == 0)
            {
               continue;
            }
            var _loc6_:TextField = DenUi.text(_loc4_.toUpperCase(),11,DenUi.GOLD_DARK);
            _loc6_.x = 4;
            _loc6_.y = _loc1_ + 6;
            _sideList.addChild(_loc6_);
            _loc1_ += 24;
            for each(_loc3_ in _loc5_)
            {
               _loc1_ = addSideRow(_loc3_.name,_loc3_.id,int(_loc3_.count),_loc1_);
            }
         }
         _sideList.y = 6;
      }

      private function addSideRow(param1:String, param2:String, param3:int, param4:Number) : Number
      {
         var _loc5_:Sprite = new Sprite();
         _loc5_.buttonMode = true;
         _loc5_.mouseChildren = false;
         _loc5_.y = param4;
         var _loc6_:Boolean = param2 == _collection;
         _loc5_.graphics.beginFill(_loc6_ ? DenUi.PICK : 0xFFFFFF,_loc6_ ? 1 : 0.01);
         _loc5_.graphics.drawRoundRect(0,0,SIDE_W - 14,ROW_H - 2,10,10);
         _loc5_.graphics.endFill();
         var _loc7_:TextField = DenUi.text("",12,DenUi.TEXT,_loc6_);
         DenUi.fitText(_loc7_,param1,SIDE_W - 56);
         _loc7_.x = 6;
         _loc7_.y = int((ROW_H - 2 - _loc7_.height) * 0.5);
         _loc5_.addChild(_loc7_);
         if(param3 >= 0)
         {
            var _loc8_:TextField = DenUi.text(String(param3),11,DenUi.TEXT_SOFT,false);
            _loc8_.x = SIDE_W - 20 - _loc8_.width;
            _loc8_.y = int((ROW_H - 2 - _loc8_.height) * 0.5);
            _loc5_.addChild(_loc8_);
         }
         _loc5_.addEventListener("mouseDown",function(param1:MouseEvent):void
         {
            param1.stopPropagation();
            AJAudio.playSubMenuBtnClick();
            _collection = param2;
            buildSideKeepScroll();
            ask(0);
         },false,0,false);
         _sideList.addChild(_loc5_);
         return param4 + ROW_H;
      }

      private function buildSideKeepScroll() : void
      {
         var _loc1_:Number = _sideList.y;
         buildSide();
         _sideList.y = _loc1_;
      }

      private function onSideWheel(param1:MouseEvent) : void
      {
         param1.stopPropagation();
         var _loc2_:Number = Math.min(0,H - 76 - _sideList.height - 6);
         _sideList.y = Math.max(_loc2_ + 6,Math.min(6,_sideList.y + param1.delta * 8));
      }

      // ---- the chips ----

      private function buildChips() : void
      {
         while(_chips.numChildren > 0)
         {
            _chips.removeChildAt(0);
         }
         var _loc1_:Number = 0;
         var _loc2_:Array = [{"id":"","name":"Everything"}].concat(_catalog.categories);
         for each(var _loc3_:Object in _loc2_)
         {
            var _loc4_:String = _loc3_.id;
            var _loc5_:Sprite = chip(_loc3_.name,_loc4_ == _category);
            _loc5_.x = _loc1_;
            _loc5_.addEventListener("mouseDown",makeChipHandler(_loc4_),false,0,false);
            _chips.addChild(_loc5_);
            _loc1_ += _loc5_.width + 6;
         }
      }

      private function makeChipHandler(param1:String) : Function
      {
         return function(param2:MouseEvent):void
         {
            param2.stopPropagation();
            AJAudio.playSubMenuBtnClick();
            _category = param1;
            var _loc3_:Number = _chips.x;
            buildChips();
            _chips.x = _loc3_;
            ask(0);
         };
      }

      private function chip(param1:String, param2:Boolean) : Sprite
      {
         var _loc3_:Sprite = new Sprite();
         _loc3_.buttonMode = true;
         _loc3_.mouseChildren = false;
         var _loc4_:TextField = DenUi.text(param1,12,param2 ? 0xFFFFFF : DenUi.TEXT);
         var _loc5_:Number = _loc4_.width + 20;
         if(param2)
         {
            DenUi.drawPill(_loc3_.graphics,_loc5_,22,0xFFD36B,0xE59A22,0x9A5C10);
         }
         else
         {
            _loc3_.graphics.lineStyle(1.5,0xC9A86A);
            _loc3_.graphics.beginFill(0xFFFFFF);
            _loc3_.graphics.drawRoundRect(0,0,_loc5_,22,22,22);
            _loc3_.graphics.endFill();
         }
         _loc4_.x = 10;
         _loc4_.y = int((22 - _loc4_.height) * 0.5);
         _loc3_.addChild(_loc4_);
         return _loc3_;
      }

      private function scrollChips(param1:int) : void
      {
         var _loc2_:Number = _chipsMask.x;
         var _loc3_:Number = Math.min(_loc2_,_loc2_ + _chipsMask.width - _chips.width);
         _chips.x = Math.max(_loc3_,Math.min(_loc2_,_chips.x + param1 * 160));
      }

      // ---- asking the server ----

      private function ask(param1:int) : void
      {
         _page = Math.max(0,param1);
         // answers to older questions still out are not shown (onReply)
         _sent++;
         setStatus(_items.length == 0 ? "Looking..." : "");
         DenXtCommManager.requestContentItems(_collection,_category,_text,_page,PAGE_SIZE);
         waitForAnswer();
      }

      private function waitForAnswer() : void
      {
         stopWaiting();
         _waitTimer = new Timer(10000,1);
         _waitTimer.addEventListener("timer",onNoAnswer,false,0,true);
         _waitTimer.start();
      }

      private function stopWaiting() : void
      {
         if(_waitTimer)
         {
            _waitTimer.stop();
            _waitTimer.removeEventListener("timer",onNoAnswer);
            _waitTimer = null;
         }
      }

      private function onNoAnswer(param1:TimerEvent) : void
      {
         _waitTimer = null;
         _buying = false;
         if(_open)
         {
            setStatus("The shop did not answer. If the server was just updated, it may need a restart.");
         }
      }

      private function onReply(param1:Object) : void
      {
         var _loc2_:String = String(param1[0]);
         var _loc3_:Boolean = String(param1[2]) == "1";
         if(_loc2_ == "dcc")
         {
            stopWaiting();
            if(!_loc3_)
            {
               setStatus("The shop can't open right now.");
               return;
            }
            try
            {
               _catalog = JSON.parse(String(param1[3]));
            }
            catch(e:Error)
            {
               setStatus("The shop can't open right now.");
               return;
            }
            if(_open)
            {
               // drawn again, with the collections and chips
               close();
               open();
            }
            return;
         }
         if(_loc2_ == "dcq")
         {
            _answered++;
            if(_answered < _sent)
            {
               return;
            }
            stopWaiting();
            if(!_loc3_)
            {
               setStatus(String(param1[3]));
               return;
            }
            _total = int(param1[3]);
            _page = int(param1[4]);
            _pages = Math.max(1,Math.ceil(_total / Math.max(1,int(param1[5]))));
            try
            {
               _items = JSON.parse(String(param1[6])) as Array;
            }
            catch(e:Error)
            {
               _items = [];
            }
            drawCards();
            return;
         }
         if(_loc2_ == "dcb")
         {
            stopWaiting();
            _buying = false;
            if(!_loc3_)
            {
               say("Not bought",String(param1[3]));
               return;
            }
            var _loc5_:int = int(param1[5]);
            UserCurrency.setCurrency(int(param1[4]),0);
            _cart = [];
            showCartCount();
            showGems();
            if(_drawer)
            {
               closeDrawer();
            }
            say("Bought!",(_loc5_ == 1 ? "1 item is" : _loc5_ + " items are") + " in your den items now: look in the den editor's Custom tab.");
            if(_onBought != null)
            {
               _onBought();
            }
         }
      }

      // ---- the cards ----

      private function drawCards() : void
      {
         if(_grid == null)
         {
            return;
         }
         while(_grid.numChildren > 0)
         {
            _grid.removeChildAt(0);
         }
         setStatus(_items.length == 0 ? (_text != "" ? "Nothing matches \"" + _text + "\"." : "Nothing here yet.") : "");
         var _loc1_:int = 0;
         while(_loc1_ < _items.length && _loc1_ < COLS * ROWS)
         {
            var _loc2_:Sprite = card(_items[_loc1_]);
            _loc2_.x = _loc1_ % COLS * (CARD_W + GAP);
            _loc2_.y = int(_loc1_ / COLS) * (CARD_H + GAP);
            _grid.addChild(_loc2_);
            _loc1_++;
         }
         showPages();
      }

      private function showPages() : void
      {
         _pageTxt.text = "Page " + (_page + 1) + " of " + _pages;
         var _loc1_:Number = GRID_X + (COLS * (CARD_W + GAP) - GAP) * 0.5;
         _pageTxt.x = int(_loc1_ - _pageTxt.width * 0.5);
         _pageTxt.y = H - 40;
         _prevBtn.x = _pageTxt.x - 20;
         _prevBtn.y = H - 30;
         _nextBtn.x = _pageTxt.x + _pageTxt.width + 20;
         _nextBtn.y = H - 30;
         _prevBtn.alpha = _page > 0 ? 1 : 0.4;
         _nextBtn.alpha = _page < _pages - 1 ? 1 : 0.4;
         _countTxt.text = _total == 1 ? "1 item" : _total + " items";
      }

      private function card(param1:Object) : Sprite
      {
         var _loc2_:Sprite = new Sprite();
         _loc2_.graphics.lineStyle(1.5,0xC9A86A);
         _loc2_.graphics.beginFill(0xFFFFFF);
         _loc2_.graphics.drawRoundRect(0,0,CARD_W,CARD_H,14,14);
         _loc2_.graphics.endFill();
         _loc2_.graphics.lineStyle();
         _loc2_.graphics.beginFill(DenUi.CREAM_LIGHT);
         _loc2_.graphics.drawRoundRect(5,5,CARD_W - 10,90,10,10);
         _loc2_.graphics.endFill();
         var _loc3_:Sprite = itemPicture(int(param1.id),CARD_W - 18,84,false);
         _loc3_.x = CARD_W * 0.5;
         _loc3_.y = 50;
         _loc2_.addChild(_loc3_);
         var _loc4_:TextField = DenUi.text("",11,DenUi.TEXT,true);
         _loc4_.wordWrap = true;
         _loc4_.multiline = true;
         _loc4_.width = CARD_W - 10;
         _loc4_.text = String(param1.name);
         if(_loc4_.numLines > 2)
         {
            var _loc5_:String = String(param1.name);
            while(_loc5_.length > 1 && _loc4_.numLines > 2)
            {
               _loc5_ = _loc5_.substr(0,_loc5_.length - 1);
               _loc4_.text = _loc5_ + "...";
            }
         }
         _loc4_.x = 5;
         _loc4_.y = 98;
         _loc2_.addChild(_loc4_);
         var _loc6_:TextField = DenUi.text(gemsText(int(param1.cost)),11,DenUi.GOLD_DARK);
         _loc6_.x = 6;
         _loc6_.y = CARD_H - 24;
         _loc2_.addChild(_loc6_);
         var _loc7_:Sprite = DenUi.greenPill("Add",46,function():void
         {
            addToCart(param1,1);
         },22);
         _loc7_.x = CARD_W - 52;
         _loc7_.y = CARD_H - 28;
         _loc2_.addChild(_loc7_);
         _loc2_.buttonMode = true;
         _loc2_.addEventListener("mouseDown",function(param2:MouseEvent):void
         {
            param2.stopPropagation();
            AJAudio.playSubMenuBtnClick();
            showDetails(param1);
         },false,0,false);
         _loc2_.addEventListener("mouseOver",function(param2:MouseEvent):void
         {
            _loc2_.filters = [new GlowFilter(0xF3D88C,1,8,8,3)];
         },false,0,false);
         _loc2_.addEventListener("mouseOut",function(param2:MouseEvent):void
         {
            _loc2_.filters = [];
         },false,0,false);
         return _loc2_;
      }

      // a den item's picture (as the game's shops draw it), fitted inside
      // `param2` x `param3`, its middle on (0, 0)
      private function itemPicture(param1:int, param2:Number, param3:Number, param4:Boolean) : Sprite
      {
         var _loc5_:Sprite = new Sprite();
         _loc5_.mouseEnabled = false;
         _loc5_.mouseChildren = false;
         if(DenXtCommManager.getDenItemDef(param1) == null)
         {
            var _loc6_:Shape = new Shape();
            DenUi.drawCrates(_loc6_.graphics,0,0,2);
            _loc5_.addChild(_loc6_);
            return _loc5_;
         }
         var _loc7_:DenItem = new DenItem();
         _loc7_.initShopItem(param1,0);
         var _loc8_:Sprite = param4 ? _loc7_.largeIcon : _loc7_.icon;
         var _loc9_:Number = param4 ? 280 : 168;
         var fit:Function = function():void
         {
            var _loc1_:Number = Math.min(param2 / Math.max(1,_loc8_.width),param3 / Math.max(1,_loc8_.height),1.4);
            _loc5_.scaleX = _loc5_.scaleY = _loc1_;
         };
         _loc7_.imageLoadedCallback = fit;
         _loc5_.addChild(_loc8_);
         _loc5_.scaleX = _loc5_.scaleY = Math.min(param2,param3) / _loc9_;
         return _loc5_;
      }

      private function gemsText(param1:int) : String
      {
         return param1 == 1 ? "1 gem" : param1 + " gems";
      }

      // ---- details ----

      private function showDetails(param1:Object) : void
      {
         closeDetails();
         _details = new Sprite();
         _details.graphics.beginFill(0,0.3);
         _details.graphics.drawRoundRect(0,0,W,H,22,22);
         _details.graphics.endFill();
         _details.addEventListener("mouseDown",function(param2:MouseEvent):void
         {
            param2.stopPropagation();
            if(param2.target == _details)
            {
               closeDetails();
            }
         },false,0,false);
         var _loc2_:Sprite = new Sprite();
         var _loc3_:Number = 470;
         var _loc4_:Number = 300;
         DenUi.woodBox(_loc2_.graphics,_loc3_,_loc4_);
         DenUi.titleStrip(_loc2_.graphics,14,10,_loc3_ - 28,26);
         var _loc5_:TextField = DenUi.title("",14);
         DenUi.fitText(_loc5_,String(param1.name),_loc3_ - 80);
         _loc5_.x = int((_loc3_ - _loc5_.width) * 0.5);
         _loc5_.y = 13;
         _loc2_.addChild(_loc5_);
         var _loc6_:Sprite = DenUi.roundButton(12,DenUi.drawCross,closeDetails);
         _loc6_.x = _loc3_ - 24;
         _loc6_.y = 23;
         _loc2_.addChild(_loc6_);
         _loc2_.graphics.lineStyle(1.5,0xC9A86A);
         _loc2_.graphics.beginFill(0xFFFFFF);
         _loc2_.graphics.drawRoundRect(20,46,200,200,16,16);
         _loc2_.graphics.endFill();
         var _loc7_:Sprite = itemPicture(int(param1.id),186,186,true);
         _loc7_.x = 120;
         _loc7_.y = 146;
         _loc2_.addChild(_loc7_);
         var _loc8_:Array = [];
         var _loc9_:String = categoryName(String(param1.cat));
         if(_loc9_ != "")
         {
            _loc8_.push(_loc9_ + (param1.placement == "wall" ? ", hangs on a wall" : (param1.placement == "rug" ? ", lies flat on the floor" : "")));
         }
         if(int(param1.w) > 0)
         {
            _loc8_.push(int(param1.w) + " x " + int(param1.h) + " in your den (you can make it up to 3x bigger there)");
         }
         var _loc10_:Array = collectionNames(param1.cols as Array);
         if(_loc10_.length > 0)
         {
            _loc8_.push("In: " + _loc10_.join(", "));
         }
         var _loc11_:TextField = DenUi.text("",12,DenUi.TEXT,false);
         _loc11_.wordWrap = true;
         _loc11_.multiline = true;
         _loc11_.width = _loc3_ - 250;
         _loc11_.text = _loc8_.join("\n\n");
         _loc11_.x = 234;
         _loc11_.y = 48;
         _loc2_.addChild(_loc11_);
         var _loc12_:TextField = DenUi.text(gemsText(int(param1.cost)),16,DenUi.GOLD_DARK);
         _loc12_.x = 234;
         _loc12_.y = 168;
         _loc2_.addChild(_loc12_);
         // how many
         var quantity:int = 1;
         var _loc13_:TextField = DenUi.text("1",15,DenUi.TEXT);
         var showQuantity:Function = function():void
         {
            _loc13_.text = String(quantity);
            _loc13_.x = 234 + 34 - int(_loc13_.width * 0.5);
         };
         var _loc14_:Sprite = DenUi.roundButton(11,drawMinus,function():void
         {
            quantity = Math.max(1,quantity - 1);
            showQuantity();
         });
         _loc14_.x = 245;
         _loc14_.y = 210;
         _loc2_.addChild(_loc14_);
         _loc13_.y = 200;
         _loc2_.addChild(_loc13_);
         var _loc15_:Sprite = DenUi.roundButton(11,drawPlus,function():void
         {
            quantity = Math.min(MAX_QUANTITY,quantity + 1);
            showQuantity();
         });
         _loc15_.x = 290;
         _loc15_.y = 210;
         _loc2_.addChild(_loc15_);
         showQuantity();
         var _loc16_:Sprite = DenUi.greenPill("Add to cart",104,function():void
         {
            addToCart(param1,quantity);
            closeDetails();
         },28);
         _loc16_.x = 234;
         _loc16_.y = 254;
         _loc2_.addChild(_loc16_);
         var _loc17_:Sprite = DenUi.goldPill("Buy now",104,function():void
         {
            closeDetails();
            confirmBuy([{"id":int(param1.id),"name":String(param1.name),"cost":int(param1.cost),"quantity":quantity}]);
         },28);
         _loc17_.x = 346;
         _loc17_.y = 254;
         _loc2_.addChild(_loc17_);
         _loc2_.x = int((W - _loc3_) * 0.5);
         _loc2_.y = int((H - _loc4_) * 0.5);
         _details.addChild(_loc2_);
         _box.addChild(_details);
      }

      private function closeDetails() : void
      {
         if(_details && _details.parent)
         {
            _details.parent.removeChild(_details);
         }
         _details = null;
      }

      private function categoryName(param1:String) : String
      {
         for each(var _loc2_:Object in _catalog.categories)
         {
            if(_loc2_.id == param1)
            {
               return String(_loc2_.name);
            }
         }
         return "";
      }

      private function collectionNames(param1:Array) : Array
      {
         var _loc2_:Array = [];
         for each(var _loc3_:String in param1)
         {
            for each(var _loc4_:Object in _catalog.collections)
            {
               if(_loc4_.id == _loc3_)
               {
                  _loc2_.push(String(_loc4_.name));
               }
            }
         }
         return _loc2_;
      }

      // ---- the cart ----

      private function addToCart(param1:Object, param2:int) : void
      {
         for each(var _loc3_:Object in _cart)
         {
            if(_loc3_.id == int(param1.id))
            {
               _loc3_.quantity = Math.min(MAX_QUANTITY,_loc3_.quantity + param2);
               cartChanged(String(param1.name) + " x" + _loc3_.quantity + " in your cart");
               return;
            }
         }
         if(_cart.length >= MAX_LINES)
         {
            say("Cart full","A cart holds " + MAX_LINES + " different items. Buy these first.");
            return;
         }
         _cart.push({
            "id":int(param1.id),
            "name":String(param1.name),
            "cost":int(param1.cost),
            "quantity":Math.min(MAX_QUANTITY,param2)
         });
         cartChanged(String(param1.name) + " added to your cart");
      }

      private function cartChanged(param1:String = "") : void
      {
         showCartCount();
         if(_drawer)
         {
            drawDrawerList();
         }
         if(param1 != "" && _cartBtn)
         {
            toast(param1);
         }
      }

      private function cartItems() : int
      {
         var _loc1_:int = 0;
         for each(var _loc2_:Object in _cart)
         {
            _loc1_ += _loc2_.quantity;
         }
         return _loc1_;
      }

      private function cartCost(param1:Array) : int
      {
         var _loc2_:int = 0;
         for each(var _loc3_:Object in param1)
         {
            _loc2_ += _loc3_.cost * _loc3_.quantity;
         }
         return _loc2_;
      }

      private function showCartCount() : void
      {
         if(_cartBtn == null)
         {
            return;
         }
         var _loc1_:TextField = _cartBtn.getChildAt(0) as TextField;
         if(_loc1_)
         {
            _loc1_.text = _cart.length == 0 ? "Cart" : "Cart (" + cartItems() + ")";
            _loc1_.x = int((118 - _loc1_.width) * 0.5);
         }
      }

      private function showGems() : void
      {
         if(_gemsTxt == null)
         {
            return;
         }
         _gemsTxt.text = "You have " + gemsText(UserCurrency.getCurrency(0));
         _gemsTxt.x = W - 146 - _gemsTxt.width;
         _gemsTxt.y = 54;
      }

      // a few words under the cart button for a moment: a little tag in the
      // look of the den editor's hints (wood around cream, brown words, a
      // gold tick), over everything, and fading away. a new one takes the
      // old one's place.
      private var _toast:Sprite;

      private var _toastTimer:Timer;

      private function toast(param1:String) : void
      {
         removeToast();
         _toast = new Sprite();
         _toast.mouseEnabled = false;
         _toast.mouseChildren = false;
         var _loc2_:TextField = DenUi.text("",12,DenUi.TEXT);
         DenUi.fitText(_loc2_,param1,300);
         var _loc3_:Number = _loc2_.width + 46;
         DenUi.woodBox(_toast.graphics,_loc3_,30,3);
         // a tick in a gold circle
         _toast.graphics.lineStyle(1.5,DenUi.GOLD_DARK);
         _toast.graphics.beginFill(DenUi.GOLD);
         _toast.graphics.drawCircle(17,15,8);
         _toast.graphics.endFill();
         _toast.graphics.lineStyle(2.5,0x2F7420);
         _toast.graphics.moveTo(13,15);
         _toast.graphics.lineTo(16,18.5);
         _toast.graphics.lineTo(21.5,11.5);
         _toast.graphics.lineStyle();
         _loc2_.x = 31;
         _loc2_.y = int((30 - _loc2_.height) * 0.5);
         _toast.addChild(_loc2_);
         _toast.filters = [new GlowFilter(0,0.25,6,6,1)];
         _toast.x = Math.max(16,Math.min(W - 16 - _loc3_,_cartBtn.x + 59 - _loc3_ * 0.5));
         _toast.y = _cartBtn.y + 34;
         _box.addChild(_toast);
         // 1.4 seconds shown, then gone in half a second
         var _loc4_:int = 0;
         _toastTimer = new Timer(50,38);
         _toastTimer.addEventListener("timer",function(param1:TimerEvent):void
         {
            _loc4_++;
            if(_toast != null && _loc4_ > 28)
            {
               _toast.alpha = (38 - _loc4_) / 10;
            }
            if(_loc4_ >= 38)
            {
               removeToast();
            }
         },false,0,false);
         _toastTimer.start();
      }

      private function removeToast() : void
      {
         if(_toastTimer)
         {
            _toastTimer.stop();
            _toastTimer = null;
         }
         if(_toast && _toast.parent)
         {
            _toast.parent.removeChild(_toast);
         }
         _toast = null;
      }

      private function toggleDrawer() : void
      {
         if(_drawer)
         {
            closeDrawer();
         }
         else
         {
            openDrawer();
         }
      }

      private function openDrawer() : void
      {
         closeDetails();
         _drawer = new Sprite();
         var _loc1_:Number = 300;
         var _loc2_:Number = H - 92;
         DenUi.woodBox(_drawer.graphics,_loc1_,_loc2_);
         DenUi.titleStrip(_drawer.graphics,12,10,_loc1_ - 24,26);
         var _loc3_:TextField = DenUi.title("Your cart",14);
         _loc3_.x = int((_loc1_ - _loc3_.width) * 0.5);
         _loc3_.y = 13;
         _drawer.addChild(_loc3_);
         var _loc4_:Sprite = DenUi.roundButton(12,DenUi.drawCross,closeDrawer);
         _loc4_.x = _loc1_ - 22;
         _loc4_.y = 23;
         _drawer.addChild(_loc4_);
         _drawerList = new Sprite();
         _drawerList.x = 14;
         _drawerList.y = 46;
         _drawer.addChild(_drawerList);
         var _loc5_:Shape = new Shape();
         _loc5_.graphics.beginFill(0);
         _loc5_.graphics.drawRect(14,44,_loc1_ - 28,_loc2_ - 140);
         _loc5_.graphics.endFill();
         _drawer.addChild(_loc5_);
         _drawerList.mask = _loc5_;
         _drawer.addEventListener("mouseWheel",function(param1:MouseEvent):void
         {
            param1.stopPropagation();
            _drawerScroll = Math.max(Math.min(0,_loc2_ - 140 - _drawerList.height - 4),Math.min(0,_drawerScroll + param1.delta * 8));
            _drawerList.y = 46 + _drawerScroll;
         },false,0,false);
         _drawer.x = W - _loc1_ - 14;
         _drawer.y = 80;
         _drawer.addEventListener("mouseDown",DenUi.stop,false,0,true);
         _box.addChild(_drawer);
         _drawerScroll = 0;
         drawDrawerList();
      }

      private function closeDrawer() : void
      {
         if(_drawer && _drawer.parent)
         {
            _drawer.parent.removeChild(_drawer);
         }
         _drawer = null;
         _drawerList = null;
      }

      private function drawDrawerList() : void
      {
         if(_drawer == null)
         {
            return;
         }
         while(_drawerList.numChildren > 0)
         {
            _drawerList.removeChildAt(0);
         }
         // the foot: total and buttons, drawn again each time
         while(_drawer.numChildren > 4)
         {
            _drawer.removeChildAt(4);
         }
         var _loc1_:Number = 300;
         var _loc2_:Number = H - 92;
         if(_cart.length == 0)
         {
            var _loc3_:TextField = DenUi.text("Your cart is empty.\nPress Add on an item to put it here.",12,DenUi.TEXT_SOFT,false);
            _loc3_.x = 6;
            _loc3_.y = 10;
            _drawerList.addChild(_loc3_);
         }
         var _loc4_:Number = 0;
         for each(var _loc5_:Object in _cart)
         {
            _drawerList.addChild(cartRow(_loc5_,_loc4_,_loc1_ - 28));
            _loc4_ += 48;
         }
         var _loc6_:Shape = new Shape();
         _loc6_.graphics.lineStyle(1.5,0xB08A50);
         _loc6_.graphics.moveTo(16,_loc2_ - 92);
         _loc6_.graphics.lineTo(_loc1_ - 16,_loc2_ - 92);
         _drawer.addChild(_loc6_);
         var _loc7_:TextField = DenUi.text("Total: " + gemsText(cartCost(_cart)) + "  (" + cartItems() + (cartItems() == 1 ? " item)" : " items)"),13,DenUi.TEXT);
         _loc7_.x = 18;
         _loc7_.y = _loc2_ - 84;
         _drawer.addChild(_loc7_);
         var _loc8_:Sprite = DenUi.greenPill("Buy all",130,function():void
         {
            confirmBuy(_cart.concat());
         },30);
         _loc8_.x = 16;
         _loc8_.y = _loc2_ - 52;
         DenUi.setEnabled(_loc8_,_cart.length > 0);
         _drawer.addChild(_loc8_);
         var _loc9_:Sprite = DenUi.redPill("Empty cart",120,function():void
         {
            _cart = [];
            cartChanged();
         },30);
         _loc9_.x = _loc1_ - 136;
         _loc9_.y = _loc2_ - 52;
         DenUi.setEnabled(_loc9_,_cart.length > 0);
         _drawer.addChild(_loc9_);
      }

      private function cartRow(param1:Object, param2:Number, param3:Number) : Sprite
      {
         var _loc4_:Sprite = new Sprite();
         _loc4_.y = param2;
         _loc4_.graphics.beginFill(0xFFFFFF,0.7);
         _loc4_.graphics.drawRoundRect(0,0,param3,44,12,12);
         _loc4_.graphics.endFill();
         // the item's picture, in a little frame on the left
         _loc4_.graphics.lineStyle(1,0xC9A86A);
         _loc4_.graphics.beginFill(DenUi.CREAM_LIGHT);
         _loc4_.graphics.drawRoundRect(3,3,38,38,8,8);
         _loc4_.graphics.endFill();
         _loc4_.graphics.lineStyle();
         var _loc11_:Sprite = itemPicture(int(param1.id),34,34,false);
         _loc11_.x = 22;
         _loc11_.y = 22;
         _loc4_.addChild(_loc11_);
         var _loc5_:TextField = DenUi.text("",12,DenUi.TEXT);
         DenUi.fitText(_loc5_,String(param1.name),param3 - 158);
         _loc5_.x = 46;
         _loc5_.y = 6;
         _loc4_.addChild(_loc5_);
         var _loc6_:TextField = DenUi.text(gemsText(param1.cost * param1.quantity),10,DenUi.GOLD_DARK,false);
         _loc6_.x = 46;
         _loc6_.y = 22;
         _loc4_.addChild(_loc6_);
         var _loc7_:Sprite = DenUi.roundButton(9,drawMinus,function():void
         {
            param1.quantity = Math.max(1,param1.quantity - 1);
            cartChanged();
         });
         _loc7_.x = param3 - 92;
         _loc7_.y = 22;
         _loc4_.addChild(_loc7_);
         var _loc8_:TextField = DenUi.text(String(param1.quantity),13,DenUi.TEXT);
         _loc8_.x = param3 - 72 - int(_loc8_.width * 0.5);
         _loc8_.y = 13;
         _loc4_.addChild(_loc8_);
         var _loc9_:Sprite = DenUi.roundButton(9,drawPlus,function():void
         {
            param1.quantity = Math.min(MAX_QUANTITY,param1.quantity + 1);
            cartChanged();
         });
         _loc9_.x = param3 - 52;
         _loc9_.y = 22;
         _loc4_.addChild(_loc9_);
         var _loc10_:Sprite = DenUi.roundButton(9,DenUi.drawCross,function():void
         {
            var _loc1_:int = _cart.indexOf(param1);
            if(_loc1_ >= 0)
            {
               _cart.splice(_loc1_,1);
            }
            cartChanged();
         });
         _loc10_.x = param3 - 16;
         _loc10_.y = 22;
         _loc4_.addChild(_loc10_);
         return _loc4_;
      }

      // ---- buying ----

      private function confirmBuy(param1:Array) : void
      {
         if(_buying || param1.length == 0)
         {
            return;
         }
         var _loc2_:int = cartCost(param1);
         var _loc3_:int = 0;
         for each(var _loc4_:Object in param1)
         {
            _loc3_ += _loc4_.quantity;
         }
         if(_loc2_ > UserCurrency.getCurrency(0))
         {
            say("Not enough gems","That costs " + gemsText(_loc2_) + ", and you have " + gemsText(UserCurrency.getCurrency(0)) + ".");
            return;
         }
         var _loc5_:String = _loc3_ == 1 ? String(param1[0].name) : _loc3_ + " items";
         var _loc6_:Array = [];
         for each(_loc4_ in param1)
         {
            _loc6_.push([_loc4_.id,_loc4_.quantity]);
         }
         DenUi.prompt(_layer,"Buy?","Buy " + _loc5_ + " for " + gemsText(_loc2_) + "?",null,[["Buy","green",function(param2:String):void
         {
            buy(_loc6_);
         }],["Cancel","red",null]]);
      }

      private function buy(param1:Array) : void
      {
         if(_buying || param1 == null || param1.length == 0)
         {
            return;
         }
         _buying = true;
         DenXtCommManager.requestContentBuy(param1);
         waitForAnswer();
      }

      private function say(param1:String, param2:String) : void
      {
         DenUi.prompt(_layer,param1,param2,null,[["OK","green",null]]);
      }

      // ---- typing ----

      private function onSearchChange(param1:Event) : void
      {
         _searchHint.visible = _search.text == "";
         if(_searchTimer == null)
         {
            _searchTimer = new Timer(350,1);
            _searchTimer.addEventListener("timer",onSearchTimer,false,0,true);
         }
         _searchTimer.reset();
         _searchTimer.start();
      }

      private function onSearchTimer(param1:TimerEvent) : void
      {
         if(!_open || _search == null)
         {
            return;
         }
         var _loc2_:String = _search.text.replace(/^\s+|\s+$/g,"");
         if(_loc2_ != _text)
         {
            _text = _loc2_;
            ask(0);
         }
      }

      private function onSearchKey(param1:KeyboardEvent) : void
      {
         // the game's own keys (chat, emotes) stay out of it
         param1.stopPropagation();
         if(param1.keyCode == 27)
         {
            if(_search.text != "")
            {
               _search.text = "";
               onSearchChange(null);
            }
            else
            {
               close();
            }
         }
         else if(param1.keyCode == 13)
         {
            if(_searchTimer)
            {
               _searchTimer.stop();
            }
            onSearchTimer(null);
         }
      }

      // ---- little pictures on buttons ----

      private static function drawLeft(param1:Graphics, param2:Number) : void
      {
         var _loc3_:Number = param2 * 0.35;
         param1.beginFill(0xFFFFFF);
         param1.moveTo(_loc3_ * 0.6,-_loc3_);
         param1.lineTo(-_loc3_ * 0.8,0);
         param1.lineTo(_loc3_ * 0.6,_loc3_);
         param1.endFill();
      }

      private static function drawRight(param1:Graphics, param2:Number) : void
      {
         var _loc3_:Number = param2 * 0.35;
         param1.beginFill(0xFFFFFF);
         param1.moveTo(-_loc3_ * 0.6,-_loc3_);
         param1.lineTo(_loc3_ * 0.8,0);
         param1.lineTo(-_loc3_ * 0.6,_loc3_);
         param1.endFill();
      }

      private static function drawMinus(param1:Graphics, param2:Number) : void
      {
         param1.lineStyle(param2 * 0.24,0xFFFFFF);
         param1.moveTo(-param2 * 0.4,0);
         param1.lineTo(param2 * 0.4,0);
         param1.lineStyle();
      }

      private static function drawPlus(param1:Graphics, param2:Number) : void
      {
         param1.lineStyle(param2 * 0.24,0xFFFFFF);
         param1.moveTo(-param2 * 0.4,0);
         param1.lineTo(param2 * 0.4,0);
         param1.moveTo(0,-param2 * 0.4);
         param1.lineTo(0,param2 * 0.4);
         param1.lineStyle();
      }

      private static function drawMagnifier(param1:Graphics, param2:Number, param3:Number) : void
      {
         param1.lineStyle(2,DenUi.TEXT_SOFT);
         param1.drawCircle(param2 - 1,param3 - 1,5);
         param1.moveTo(param2 + 3,param3 + 3);
         param1.lineTo(param2 + 7,param3 + 7);
         param1.lineStyle();
      }

      // the den editor's top right button: a shop bag with a star
      public static function drawShopIcon(param1:Graphics, param2:Number, param3:Number, param4:Number = 1) : void
      {
         param1.lineStyle(1.5,DenUi.WOOD_DARK);
         param1.beginFill(0xF3C24E);
         param1.moveTo(param2 - 9 * param4,param3 - 4 * param4);
         param1.lineTo(param2 + 9 * param4,param3 - 4 * param4);
         param1.lineTo(param2 + 7 * param4,param3 + 10 * param4);
         param1.lineTo(param2 - 7 * param4,param3 + 10 * param4);
         param1.lineTo(param2 - 9 * param4,param3 - 4 * param4);
         param1.endFill();
         param1.lineStyle(1.5,DenUi.WOOD_DARK);
         param1.moveTo(param2 - 4 * param4,param3 - 4 * param4);
         param1.curveTo(param2 - 4 * param4,param3 - 11 * param4,param2,param3 - 11 * param4);
         param1.curveTo(param2 + 4 * param4,param3 - 11 * param4,param2 + 4 * param4,param3 - 4 * param4);
         param1.lineStyle();
         param1.beginFill(0xFFFFFF);
         star(param1,param2,param3 + 3 * param4,4 * param4);
         param1.endFill();
      }

      private static function star(param1:Graphics, param2:Number, param3:Number, param4:Number) : void
      {
         var _loc5_:int = 0;
         while(_loc5_ < 10)
         {
            var _loc6_:Number = -Math.PI / 2 + _loc5_ * Math.PI / 5;
            var _loc7_:Number = _loc5_ % 2 == 0 ? param4 : param4 * 0.45;
            if(_loc5_ == 0)
            {
               param1.moveTo(param2 + Math.cos(_loc6_) * _loc7_,param3 + Math.sin(_loc6_) * _loc7_);
            }
            else
            {
               param1.lineTo(param2 + Math.cos(_loc6_) * _loc7_,param3 + Math.sin(_loc6_) * _loc7_);
            }
            _loc5_++;
         }
      }
   }
}
