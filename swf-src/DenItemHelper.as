package loader
{
   import Enums.DenItemDef;
   import avatar.AvatarManager;
   import avatar.MannequinData;
   import com.sbi.loader.FileServerEvent;
   import com.sbi.loader.SwfImports;
   import den.DenItem;
   import den.DenStateItem;
   import den.DenXtCommManager;
   import flash.display.Bitmap;
   import flash.display.BitmapData;
   import flash.display.Shape;
   import flash.filters.BlurFilter;
   import flash.geom.ColorTransform;
   import flash.filters.GlowFilter;
   import flash.geom.Matrix;
   import flash.geom.Point;
   import flash.geom.Rectangle;
   import flash.display.DisplayObject;
   import flash.display.Loader;
   import flash.display.MovieClip;
   import flash.display.Sprite;
   import flash.events.Event;
   import flash.events.MouseEvent;
   import flash.net.URLLoader;
   import flash.net.URLRequest;
   import flash.utils.ByteArray;
   import pet.PetItem;
   import pet.PetManager;
   import room.DenItemHolder;
   
   public class DenItemHelper
   {
      
      private var _denItem:DenItem;
      
      private var _denStateItem:DenStateItem;
      
      private var _defId:int;
      
      private var _id:uint;
      
      private var _callback:Function;
      
      private var _loader:Loader;
      
      private var _sprite:Sprite;
      
      private var _portalSprite:Sprite;
      
      private var _sortOffset:int;
      
      private var _minigameDefId:int;
      
      private var _nameStrId:int;
      
      private var _listLauncherId:int;
      
      private var _version:int;
      
      private var _version2:int;
      
      private var _version3:int;
      
      private var _petItem:PetItem;
      
      private var _bFlipLabel:Boolean;
      
      private var _isUniqueImageItem:Boolean;
      
      private var _uniqueImageId:String;
      
      private var _uniqueImageCreator:String;
      
      private var _uniqueImageCreatorDbId:int;
      
      private var _uniqueImageCreatorUUID:String;
      
      private var _isMannequin:Boolean;
      
      private var _isDenStore:Boolean;
      
      private var _masterpieceDefHelper:MasterpieceDefHelper;
      
      private var _mannequinData:MannequinData;
      
      private var _onMouseDownCallback:Function;
      
      private var _onMouseOverCallback:Function;
      
      private var _onMouseOutCallback:Function;
      
      private var _uniqueImage:Sprite;
      
      public function DenItemHelper()
      {
         super();
      }
      
      public function get displayObject() : Sprite
      {
         return _sprite;
      }
      
      public function get content() : DisplayObject
      {
         return _loader.content;
      }
      
      public function get sortOffset() : int
      {
         // The low two flip bits are used by the original client.  Den editing
         // also uses bits 2-3 as the item's player depth: 1 = always behind
         // players and 2 = always in front (a very large offset wins over the
         // normal y-position depth sort without visibly moving the item), and
         // bits 16-30 as a nudge of so many pixels further in front, which the
         // layers panel sets to put items in the order it shows
         // (room.DenItemHolder).
         if(_denStateItem != null)
         {
            var _loc1_:int = DenItemHolder.depthOf(_denStateItem.flipped);
            // bits 6-7, its size (DenItemHolder.sizeOf): the sort line grows with it
            var _loc2_:int = Math.round(_sortOffset * DenItemHolder.sizeOf(_denStateItem.flipped)) - DenItemHolder.nudgeOf(_denStateItem.flipped);
            if(_loc1_ == 1)
            {
               return _loc2_ + 1000000;
            }
            if(_loc1_ == 2)
            {
               return _loc2_ - 1000000;
            }
            return _loc2_;
         }
         return _sortOffset;
      }
      
      public function get id() : int
      {
         return _id;
      }
      
      public function get minigameDefId() : int
      {
         return _minigameDefId;
      }
      
      public function get bFlipLabel() : Boolean
      {
         return _bFlipLabel;
      }
      
      public function get isUniqueImageItem() : Boolean
      {
         return _isUniqueImageItem;
      }
      
      public function get listLauncherId() : int
      {
         return _listLauncherId;
      }
      
      public function get nameStrId() : int
      {
         return _nameStrId;
      }
      
      public function get uniqueImage() : Sprite
      {
         return _uniqueImage;
      }
      
      public function get uniqueImageId() : String
      {
         return _uniqueImageId;
      }
      
      public function set uniqueImageId(param1:String) : void
      {
         _uniqueImageId = param1;
      }
      
      public function get uniqueImageCreator() : String
      {
         return _uniqueImageCreator;
      }
      
      public function set uniqueImageCreator(param1:String) : void
      {
         _uniqueImageCreator = param1;
      }
      
      public function get uniqueImageCreatorDbId() : int
      {
         return _uniqueImageCreatorDbId;
      }
      
      public function get uniqueImageCreatorUUID() : String
      {
         return _uniqueImageCreatorUUID;
      }
      
      public function get denStateItem() : DenStateItem
      {
         return _denStateItem;
      }
      
      public function get defId() : int
      {
         return _defId;
      }
      
      public function get version() : int
      {
         return _version;
      }
      
      public function get mannequin() : MannequinData
      {
         return _mannequinData;
      }
      
      public function get isMannequin() : Boolean
      {
         return _isMannequin;
      }
      
      public function get isDenStore() : Boolean
      {
         return _isDenStore;
      }
      
      public function get contentWidth() : int
      {
         if(_loader != null && _loader.content != null)
         {
            if(_loader.content.hasOwnProperty("sizeCont"))
            {
               return _loader.content["sizeCont"].width;
            }
            return _loader.content.width;
         }
         return 0;
      }
      
      public function get contentHeight() : int
      {
         if(_loader != null && _loader.content != null)
         {
            if(_loader.content.hasOwnProperty("sizeCont"))
            {
               return _loader.content["sizeCont"].height;
            }
            return _loader.content.height;
         }
         return 0;
      }
      
      public function get currDenItem() : DenItem
      {
         return _denItem;
      }
      
      public function init(param1:DenItem, param2:Function, param3:PetItem = null, param4:int = 0, param5:int = 0, param6:MannequinData = null) : void
      {
         _denItem = param1;
         _defId = param1.defId;
         _id = uint(_defId << 16 | DenItem.getIconId(param1.sortId));
         _callback = param2;
         _minigameDefId = param1.minigameDefId;
         _nameStrId = param5;
         _listLauncherId = param4;
         _bFlipLabel = false;
         _isUniqueImageItem = false;
         _petItem = param3;
         _version = param1.sortId == 99 ? _petItem.petBits[0] : param1.version;
         _version2 = param1.sortId == 99 ? _petItem.petBits[1] : 0;
         _version3 = param1.sortId == 99 ? _petItem.petBits[2] : 0;
         _loader = new Loader();
         _sprite = new Sprite();
         _portalSprite = new Sprite();
         _uniqueImage = new Sprite();
         _uniqueImageId = param1.uniqueImageId;
         _uniqueImageCreator = param1.uniqueImageCreator;
         _uniqueImageCreatorDbId = param1.uniqueImageCreatorDbId;
         _uniqueImageCreatorUUID = param1.uniqueImageCreatorUUID;
         _mannequinData = param6;
         if(loadCustomArt())
         {
            return;
         }
         loadBaseArt();
      }
      
      public function initDS(param1:DenStateItem, param2:Function) : void
      {
         _denStateItem = param1;
         _defId = param1.defId;
         _id = uint(_defId << 16 | param1.catId);
         _callback = param2;
         _minigameDefId = param1.minigameDefId;
         _nameStrId = param1.nameStrId;
         _listLauncherId = param1.listLauncherId;
         _bFlipLabel = false;
         _isUniqueImageItem = false;
         _petItem = param1.petItem;
         _version = param1.sortCatId == 99 ? _petItem.petBits[0] : param1.version;
         _version2 = param1.sortCatId == 99 ? _petItem.petBits[1] : 0;
         _version3 = param1.sortCatId == 99 ? _petItem.petBits[2] : 0;
         _loader = new Loader();
         _sprite = new Sprite();
         _portalSprite = new Sprite();
         _uniqueImage = new Sprite();
         _uniqueImageId = param1.uniqueImageId;
         _uniqueImageCreator = param1.uniqueImageCreator;
         _uniqueImageCreatorDbId = param1.uniqueImageCreatorDbId;
         _uniqueImageCreatorUUID = param1.uniqueImageCreatorUUID;
         _mannequinData = param1.mannequinData;
         // a wallpaper (3) or floor (2) with a picture: drawn into the base's
         // own art for this den (themeTexture, below)
         if(param1.sortCatId == 2 || param1.sortCatId == 3)
         {
            _themeArtUrl = AJClient.customArtUrl("den",_defId);
            _themeIsFloor = param1.sortCatId == 2;
            _themeLook = AJClient.customArtMode("den",_defId) == "segments" && !_themeIsFloor ? "segments" : "pattern";
            loadBaseArt();
            return;
         }
         if(loadCustomArt())
         {
            return;
         }
         loadBaseArt();
      }
      
      public function initGeneric(param1:DenItemDef, param2:Function, param3:int = 0, param4:int = 0, param5:int = 0, param6:String = "", param7:int = -1, param8:String = "", param9:PetItem = null, param10:MannequinData = null) : void
      {
         _defId = param1.id;
         _id = uint(_defId << 16 | DenItem.getIconId(param1.sortCat));
         _callback = param2;
         _minigameDefId = param1.gameDefId;
         _nameStrId = param5;
         _listLauncherId = param4;
         _bFlipLabel = false;
         _isUniqueImageItem = false;
         _petItem = param9;
         _version = param1.sortCat == 99 ? _petItem.petBits[0] : param3;
         _version2 = param1.sortCat == 99 ? _petItem.petBits[1] : 0;
         _version3 = param1.sortCat == 99 ? _petItem.petBits[2] : 0;
         _loader = new Loader();
         _sprite = new Sprite();
         _portalSprite = new Sprite();
         _uniqueImage = new Sprite();
         _uniqueImageId = param6;
         _uniqueImageCreator = "";
         _uniqueImageCreatorDbId = param7;
         _uniqueImageCreatorUUID = param8;
         _mannequinData = param10;
         if(loadCustomArt())
         {
            return;
         }
         loadBaseArt();
      }
      
      public function destroy() : void
      {
         DenItemServer.instance.removeEventListener("OnNewData",handleData);
         if(_loader)
         {
            if(_loader.parent)
            {
               _loader.parent.removeChild(_loader);
            }
            _loader.unloadAndStop(true);
         }
         _callback = null;
         _sprite = null;
         if(_themeBitmap != null && _themeBitmap.bitmapData != null)
         {
            _themeBitmap.bitmapData.dispose();
         }
         _themeBitmap = null;
      }
      
      public function loadUniqueImage() : void
      {
         if(_loader && _loader.content && _loader.content.hasOwnProperty("setUniqueImage"))
         {
            _isUniqueImageItem = true;
            if(_uniqueImageId != "")
            {
               _masterpieceDefHelper = new MasterpieceDefHelper();
               _masterpieceDefHelper.init(_uniqueImageId,onUniqueImageIdLoaded);
            }
         }
      }
      
      public function setupItemWithEmotes(param1:DenStateItem) : void
      {
         _denStateItem = param1;
      }
      
      public function addPortalListeners(param1:DenStateItem, param2:Function, param3:Function = null, param4:Function = null) : void
      {
         _denStateItem = param1;
         _onMouseDownCallback = param2;
         _portalSprite.addEventListener("mouseDown",onMouseDown,false,0,true);
         if(param3 != null)
         {
            _onMouseOverCallback = param3;
            _portalSprite.addEventListener("mouseOver",onMouseOver,false,0,true);
         }
         if(param4 != null)
         {
            _onMouseOutCallback = param4;
            _portalSprite.addEventListener("mouseOut",onMouseOut,false,0,true);
         }
      }
      
      public function addMouseListeners(param1:DenStateItem, param2:Function, param3:Function = null, param4:Function = null) : void
      {
         _denStateItem = param1;
         _onMouseDownCallback = param2;
         _sprite.addEventListener("mouseDown",onMouseDown,false,0,true);
         if(param3 != null)
         {
            _onMouseOverCallback = param3;
            _sprite.addEventListener("mouseOver",onMouseOver,false,0,true);
         }
         if(param4 != null)
         {
            _onMouseOutCallback = param4;
            _sprite.addEventListener("mouseOut",onMouseOut,false,0,true);
         }
      }
      
      public function removeMouseListeners() : void
      {
         _denStateItem = null;
         _onMouseDownCallback = null;
         _sprite.removeEventListener("mouseDown",onMouseDown);
         if(_onMouseOverCallback != null)
         {
            _onMouseOverCallback = null;
            _sprite.removeEventListener("mouseOver",onMouseOver);
         }
         if(_onMouseOutCallback != null)
         {
            _onMouseOutCallback = null;
            _sprite.removeEventListener("mouseOut",onMouseOut);
         }
      }
      
      public function removePortalListeners() : void
      {
         _denStateItem = null;
         _onMouseDownCallback = null;
         _portalSprite.removeEventListener("mouseDown",onMouseDown);
         if(_onMouseOverCallback != null)
         {
            _onMouseOverCallback = null;
            _portalSprite.removeEventListener("mouseOver",onMouseOver);
         }
         if(_onMouseOutCallback != null)
         {
            _onMouseOutCallback = null;
            _portalSprite.removeEventListener("mouseOut",onMouseOut);
         }
      }
      
      public function getVersions() : Array
      {
         if(_loader && _loader.content && _loader.content.hasOwnProperty("getVersions"))
         {
            return _loader.content["getVersions"]();
         }
         return null;
      }
      
      public function setVersion(param1:int, param2:int = 0, param3:int = 0) : void
      {
         var _loc5_:MovieClip = null;
         var _loc4_:int = 0;
         _version = param1;
         if(param2 > 0)
         {
            _version2 = param2;
         }
         if(param3 > 0)
         {
            _version3 = param3;
         }
         if(_loader && _loader.content)
         {
            if(_loader.content.hasOwnProperty("setVersion"))
            {
               if(_version == -1)
               {
                  _version = getVersions()[0];
               }
               _loader.content["setVersion"](param1);
            }
            else if(_loader.content.hasOwnProperty("pet"))
            {
               _loc5_ = MovieClip(_loader.content);
               PetManager.setPetState(_loc5_,_version,_version2,_version3);
               if(_petItem && _petItem.isEgg)
               {
                  if(_loc5_.pet.hasOwnProperty("setEggDayInt"))
                  {
                     _loc4_ = _petItem.createdTs > 0 ? Math.floor((Utility.getInitialEpochTime() - _petItem.createdTs) / 86400) : 0;
                     _loc5_.pet.setEggDayInt(_loc4_);
                  }
               }
            }
         }
      }
      
      public function rebuildMannequinView() : void
      {
         var _loc1_:DenItemDef = DenXtCommManager.getDenItemDef(_defId);
         // a custom picture (a Bitmap) has no mannequin to dress
         if(_loc1_ != null && _loc1_.mannequinAvatarDefId > 0 && _loader.content is MovieClip)
         {
            _isMannequin = true;
            _mannequinData.setupMannequinAvatarView(_loc1_,MovieClip(_loader.content));
         }
      }
      
      // a custom den item's own picture (AJClient.customArtUrl): in place of
      // the game's art, as its icon and in a den. it goes into _loader, as the
      // game's art does (the icon, shop, den and gift code all look for a
      // Loader first in _sprite), its top left on the origin and fitted in
      // CUSTOM_ART_SIDE: the den stands it on its spot from contentWidth and
      // contentHeight, as it does any item. one that does not load (or with
      // bytes Flash cannot read) is drawn with its base's art instead.
      private static const CUSTOM_ART_SIDE:int = 160;

      // pictures' bytes by address, fetched once for every icon and den item
      // showing them (each decodes its own copy). those asked for while one
      // is fetched wait for it; its URLLoader is kept here meanwhile, or it
      // could be collected before it finishes. past CUSTOM_ART_MAX it starts
      // afresh.
      private static const CUSTOM_ART_MAX:int = 100;

      private static var _artBytes:Object = {};

      private static var _artBytesCount:int = 0;

      private static var _artFetching:Object = {};

      private function loadCustomArt() : Boolean
      {
         var _loc1_:String = AJClient.customArtUrl("den",_defId);
         if(_loc1_ == null)
         {
            return false;
         }
         _sortOffset = 0;
         fetchArtBytes(_loc1_,customArtBytesReceived);
         return true;
      }

      private static function fetchArtBytes(param1:String, param2:Function) : void
      {
         var url:String = param1;
         if(_artBytes[url] != null)
         {
            param2(_artBytes[url]);
            return;
         }
         if(_artFetching[url] != null)
         {
            _artFetching[url].waiting.push(param2);
            return;
         }
         var fetch:URLLoader = new URLLoader();
         _artFetching[url] = {"loader":fetch,"waiting":[param2]};
         var finish:Function = function(param1:ByteArray):void
         {
            var _loc2_:Array = _artFetching[url].waiting;
            fetch.removeEventListener("complete",fetched);
            fetch.removeEventListener("ioError",notFetched);
            fetch.removeEventListener("securityError",notFetched);
            delete _artFetching[url];
            if(param1 != null)
            {
               if(_artBytesCount >= CUSTOM_ART_MAX)
               {
                  _artBytes = {};
                  _artBytesCount = 0;
               }
               _artBytes[url] = param1;
               _artBytesCount++;
            }
            for each(var _loc3_:Function in _loc2_)
            {
               try
               {
                  _loc3_(param1);
               }
               catch(e:Error)
               {
               }
            }
         };
         var fetched:Function = function(param1:Event):void
         {
            var _loc2_:ByteArray = fetch.data as ByteArray;
            finish(_loc2_ != null && _loc2_.length > 0 ? _loc2_ : null);
         };
         var notFetched:Function = function(param1:Event):void
         {
            finish(null);
         };
         fetch.dataFormat = "binary";
         fetch.addEventListener("complete",fetched);
         fetch.addEventListener("ioError",notFetched);
         fetch.addEventListener("securityError",notFetched);
         try
         {
            fetch.load(new URLRequest(url));
         }
         catch(e:Error)
         {
            finish(null);
         }
      }

      private function customArtBytesReceived(param1:ByteArray) : void
      {
         if(_sprite == null)
         {
            return;
         }
         if(param1 == null)
         {
            loadBaseArt();
            return;
         }
         _loader.contentLoaderInfo.addEventListener("complete",onCustomArtLoaded);
         _loader.contentLoaderInfo.addEventListener("ioError",onCustomArtFailed);
         try
         {
            _loader.loadBytes(param1);
         }
         catch(e:Error)
         {
            onCustomArtFailed(null);
         }
      }

      private function onCustomArtLoaded(param1:Event) : void
      {
         var _loc2_:Bitmap = null;
         var _loc3_:Number = NaN;
         _loader.contentLoaderInfo.removeEventListener("complete",onCustomArtLoaded);
         _loader.contentLoaderInfo.removeEventListener("ioError",onCustomArtFailed);
         if(_sprite == null)
         {
            return;
         }
         _loc2_ = _loader.content as Bitmap;
         if(_loc2_ == null || _loc2_.bitmapData == null)
         {
            _loader.unload();
            loadBaseArt();
            return;
         }
         _loc2_.smoothing = true;
         _loc3_ = Math.min(1,CUSTOM_ART_SIDE / Math.max(1,_loc2_.bitmapData.width),CUSTOM_ART_SIDE / Math.max(1,_loc2_.bitmapData.height));
         _loc2_.scaleX = _loc2_.scaleY = _loc3_;
         _loc2_.x = 0;
         _loc2_.y = 0;
         _sprite.addChild(_loader);
         _sprite.addChild(_portalSprite);
         if(_callback != null)
         {
            _callback(this);
            _callback = null;
         }
      }

      private function onCustomArtFailed(param1:Event) : void
      {
         _loader.contentLoaderInfo.removeEventListener("complete",onCustomArtLoaded);
         _loader.contentLoaderInfo.removeEventListener("ioError",onCustomArtFailed);
         if(_sprite != null)
         {
            loadBaseArt();
         }
      }

      // the base item's own file, as for any item without a picture
      private function loadBaseArt() : void
      {
         DenItemServer.instance.addEventListener("OnNewData",handleData,false,0,true);
         DenItemServer.instance.requestFile(_id);
      }

      private function handleData(param1:FileServerEvent) : void
      {
         var _loc2_:Object = null;
         if(param1.id == _id && param1.success)
         {
            DenItemServer.instance.removeEventListener("OnNewData",handleData);
            _loader.contentLoaderInfo.addEventListener("complete",onBytesLoaded);
            param1.data.position = 0;
            _loc2_ = param1.data.readObject();
            _sortOffset = _loc2_.so;
            _loader.loadBytes(SwfImports.strip(_loc2_.ba));
         }
      }
      
      private function onBytesLoaded(param1:Event) : void
      {
         var _loc3_:MovieClip = null;
         var _loc2_:int = 0;
         var _loc4_:DenItemDef = null;
         _loader.contentLoaderInfo.removeEventListener("complete",onBytesLoaded);
         var _loc5_:Array = _loader.content["currentLabels"];
         if(_loc5_.length >= 0)
         {
            for each(var _loc6_:Object in _loc5_)
            {
               if(_loc6_.name == "flip")
               {
                  _bFlipLabel = true;
                  break;
               }
            }
            if(!Utility.doesItAnimate(_loader.content))
            {
               _loader.cacheAsBitmap = true;
            }
         }
         if(_version == -1)
         {
            if(_loader.content.hasOwnProperty("getVersions"))
            {
               _version = getVersions()[0];
            }
            else
            {
               _version = 0;
            }
         }
         if(_loader.content.hasOwnProperty("setVersion") && _version >= 0)
         {
            MovieClip(_loader.content).setVersion(_version);
         }
         else if(_loader.content.hasOwnProperty("pet"))
         {
            _loc3_ = MovieClip(_loader.content);
            PetManager.setPetState(_loc3_,_version,_version2,_version3);
            if(_petItem && _petItem.isEgg)
            {
               if(_loc3_.pet.hasOwnProperty("setEggDayInt"))
               {
                  _loc2_ = _petItem.createdTs > 0 ? Math.floor((Utility.getInitialEpochTime() - _petItem.createdTs) / 86400) : 0;
                  _loc3_.pet.setEggDayInt(_loc2_);
               }
            }
         }
         if(MovieClip(_loader.content).isMoveToDisabled)
         {
            _loader.name = "moveToDisabled";
         }
         if(_mannequinData != null)
         {
            _loc4_ = DenXtCommManager.getDenItemDef(_defId);
            if(_loc4_ != null && _loc4_.mannequinAvatarDefId > 0)
            {
               _isMannequin = true;
               _mannequinData.setupMannequinAvatarView(_loc4_,MovieClip(_loader.content));
            }
         }
         if(_denStateItem != null)
         {
            if(_denStateItem.specialType == 1)
            {
               _portalSprite.addChild(MovieClip(_loader.content).clickObject);
            }
            else if(_denStateItem.specialType == 2 && _loader.content.hasOwnProperty("setEmoteCallback"))
            {
               MovieClip(_loader.content).setEmoteCallback(onEmoteItemClicked);
            }
            else if(_denStateItem.specialType == 5)
            {
               _isDenStore = true;
            }
         }
         if(_loader.content.hasOwnProperty("setUniqueImage"))
         {
            _isUniqueImageItem = true;
            if(_uniqueImageId != "")
            {
               _masterpieceDefHelper = new MasterpieceDefHelper();
               _masterpieceDefHelper.init(_uniqueImageId,onUniqueImageIdLoaded);
            }
         }
         if(_themeArtUrl != null)
         {
            fetchArtBytes(_themeArtUrl,onThemeTileBytes);
            return;
         }
         finishLoad();
      }

      // ---- custom wallpapers and floors (this server) ----
      // a wallpaper's or floor's file is drawn for the den it is in (its id
      // carries the den's denCatId), so a picture of its own cannot simply
      // stand in for it as other den items' pictures do. the base's own file
      // for this den is loaded as ever and used as a stencil: the picture is
      // tiled inside its outline, slanted as the den's walls and floors are,
      // and the base's light and shade laid back over it. so one picture
      // fits every den. (docs/CUSTOM_ITEM_ART.md has what pictures suit.)
      private var _themeArtUrl:String = null;

      private var _themeIsFloor:Boolean = false;

      // its look (AJClient.customArtMode; lib/customitems.js LOOKS_BY_USE):
      // "pattern" (a tile, over and over) or, for a wallpaper, "segments"
      // (floor up at its own size, side by side along each wall). a look
      // for floors is added in themeTexture.
      private var _themeLook:String = "pattern";

      private var _themeLoader:Loader = null;

      private var _themeBitmap:Bitmap = null;

      // the bitmaps are full size; a den bigger than this keeps its base
      private static const THEME_MAX_PIXELS:int = 12000000;

      // the stencil is read at a quarter size, for its walls' slants
      private static const THEME_STEP:int = 4;

      // the slant of a wall: dy per dx, as the game's walls are drawn
      private static const THEME_SLANT:Number = 0.5;

      // what onBytesLoaded did last, once the item is ready
      private function finishLoad() : void
      {
         _sprite.addChild(_loader);
         if(_themeBitmap != null)
         {
            _loader.visible = false;
            _sprite.addChild(_themeBitmap);
         }
         _sprite.addChild(_portalSprite);
         if(_callback != null)
         {
            _callback(this);
            _callback = null;
         }
      }

      private function onThemeTileBytes(param1:ByteArray) : void
      {
         if(_sprite == null)
         {
            return;
         }
         if(param1 == null)
         {
            finishLoad();
            return;
         }
         _themeLoader = new Loader();
         _themeLoader.contentLoaderInfo.addEventListener("complete",onThemeTileLoaded);
         _themeLoader.contentLoaderInfo.addEventListener("ioError",onThemeTileFailed);
         try
         {
            _themeLoader.loadBytes(param1);
         }
         catch(e:Error)
         {
            onThemeTileFailed(null);
         }
      }

      private function onThemeTileFailed(param1:Event) : void
      {
         if(_sprite != null)
         {
            finishLoad();
         }
      }

      private function onThemeTileLoaded(param1:Event) : void
      {
         var _loc2_:Bitmap = null;
         if(_sprite == null)
         {
            return;
         }
         _loc2_ = _themeLoader.content as Bitmap;
         try
         {
            if(_loc2_ != null && _loc2_.bitmapData != null)
            {
               _themeBitmap = themeTexture(_loader.content,_loc2_.bitmapData,_themeIsFloor,_themeLook);
            }
         }
         catch(e:Error)
         {
            _themeBitmap = null;
         }
         _themeLoader.unload();
         _themeLoader = null;
         finishLoad();
      }

      // the picture `param2` in the shape of `param1` (the base's art for
      // this den), a floor's (`param3`) or walls', in look `param4`; null
      // when it cannot be made
      private static function themeTexture(param1:DisplayObject, param2:BitmapData, param3:Boolean, param4:String = "pattern") : Bitmap
      {
         var _loc4_:Rectangle = param1.getBounds(param1);
         var _loc5_:int = Math.ceil(_loc4_.width);
         var _loc6_:int = Math.ceil(_loc4_.height);
         if(_loc5_ < 2 || _loc6_ < 2 || _loc5_ > 8000 || _loc6_ > 8000 || _loc5_ * _loc6_ > THEME_MAX_PIXELS)
         {
            return null;
         }
         var _loc7_:BitmapData = new BitmapData(_loc5_,_loc6_,true,0);
         _loc7_.draw(param1,new Matrix(1,0,0,1,-_loc4_.x,-_loc4_.y));
         var _loc8_:BitmapData = new BitmapData(_loc5_,_loc6_,true,0);
         var _loc9_:Shape = new Shape();
         var _loc10_:Array = null;
         if(param3)
         {
            // a floor: the picture laid flat, as the game's floors are (2:1)
            _loc9_.graphics.beginBitmapFill(param2,floorMatrix(_loc4_),true,true);
            _loc9_.graphics.drawRect(0,0,_loc5_,_loc6_);
            _loc9_.graphics.endFill();
         }
         else if(param4 == "segments")
         {
            // a wall in segments: each stretch of wall from its left end,
            // the picture side by side at its own size, its bottom on the
            // floor line, slanted with the wall. a wall lower than the
            // picture shows its bottom part; one higher, its top row drawn
            // on up (the fill is not repeated, so its edges carry on)
            _loc10_ = wallRuns(_loc7_);
            for each(var _loc13_:Array in _loc10_)
            {
               // the first segment that reaches this stretch, from its origin
               var _loc14_:int = Math.floor((_loc13_[0] - _loc13_[6]) / param2.width);
               while(_loc13_[6] + _loc14_ * param2.width < _loc13_[0] + _loc13_[2])
               {
                  var _loc15_:Number = _loc13_[6] + _loc14_ * param2.width;
                  var _loc16_:Number = Math.max(_loc15_,_loc13_[0]);
                  _loc9_.graphics.beginBitmapFill(param2,new Matrix(1,_loc13_[4],0,1,_loc15_,_loc13_[5] + _loc13_[4] * (_loc15_ - _loc13_[0]) - param2.height),false,true);
                  _loc9_.graphics.drawRect(_loc16_,_loc13_[1],Math.min(_loc15_ + param2.width,_loc13_[0] + _loc13_[2]) - _loc16_,_loc13_[3]);
                  _loc9_.graphics.endFill();
                  _loc14_++;
               }
            }
         }
         else
         {
            // a wall as a pattern: each stretch of each wall slanted its own way
            _loc10_ = wallRuns(_loc7_);
            for each(var _loc11_:Array in _loc10_)
            {
               _loc9_.graphics.beginBitmapFill(param2,wallMatrix(_loc4_,_loc11_[4]),true,true);
               _loc9_.graphics.drawRect(_loc11_[0],_loc11_[1],_loc11_[2],_loc11_[3]);
               _loc9_.graphics.endFill();
            }
         }
         _loc8_.draw(_loc9_);
         themeShade(_loc8_,_loc7_,param3 ? null : _loc10_);
         _loc7_.dispose();
         var _loc12_:Bitmap = new Bitmap(_loc8_,"auto",true);
         _loc12_.x = _loc4_.x;
         _loc12_.y = _loc4_.y;
         return _loc12_;
      }

      // the picture's place in the room, the same in any den: room
      // coordinates, so tiles line up across walls of one height
      private static function floorMatrix(param1:Rectangle) : Matrix
      {
         var _loc2_:Matrix = new Matrix();
         _loc2_.rotate(Math.PI / 4);
         _loc2_.scale(1,THEME_SLANT);
         _loc2_.translate(-param1.x,-param1.y);
         return _loc2_;
      }

      private static function wallMatrix(param1:Rectangle, param2:Number) : Matrix
      {
         // x along the wall, y down it: y' = y + slant * x
         var _loc3_:Matrix = new Matrix(1,param2,0,1,0,0);
         _loc3_.translate(-param1.x,-param1.y - param2 * param1.x);
         return _loc3_;
      }

      // the walls in the stencil `param1`, as [x, y, width, height, slant,
      // foot, origin, head] rectangles (full size) covering them: `foot` and
      // `head` the y of the wall's foot and top at its left end (each runs
      // on with the slant), `origin` the x its segments are counted from: each separate piece of wall
      // is found, and each column of it given the slant of its top and
      // bottom edges there, -0.5 (rising to the right), 0 or 0.5, so a
      // corner where two walls meet turns with them
      private static function wallRuns(param1:BitmapData) : Array
      {
         var _loc2_:int = Math.max(1,Math.ceil(param1.width / THEME_STEP));
         var _loc3_:int = Math.max(1,Math.ceil(param1.height / THEME_STEP));
         var _loc4_:BitmapData = new BitmapData(_loc2_,_loc3_,true,0);
         _loc4_.draw(param1,new Matrix(1 / THEME_STEP,0,0,1 / THEME_STEP));
         var _loc5_:BitmapData = new BitmapData(_loc2_,_loc3_,true,0);
         // white where there is wall, clear elsewhere
         _loc5_.threshold(_loc4_,_loc5_.rect,new Point(0,0),">=",2147483648,4294967295,4278190080,false);
         _loc4_.dispose();
         var _loc6_:Array = [];
         var _loc7_:uint = 1;
         var _loc8_:int = 0;
         var _loc9_:int = 0;
         var _loc10_:uint = 0;
         var _loc11_:Rectangle = null;
         while(_loc9_ < _loc3_)
         {
            _loc8_ = 0;
            while(_loc8_ < _loc2_)
            {
               if(_loc5_.getPixel32(_loc8_,_loc9_) == 4294967295 && _loc7_ < 16777000)
               {
                  _loc10_ = 4278190080 | _loc7_++;
                  _loc5_.floodFill(_loc8_,_loc9_,_loc10_);
                  _loc11_ = _loc5_.getColorBoundsRect(4294967295,_loc10_,true);
                  if(_loc11_.width * _loc11_.height >= 6)
                  {
                     pieceRuns(_loc5_,_loc10_,_loc11_,_loc6_);
                  }
               }
               _loc8_++;
            }
            _loc9_++;
         }
         _loc5_.dispose();
         stackRuns(_loc6_);
         return _loc6_;
      }

      // how far apart (px) a piece of wall may be above another and still
      // stand on it
      private static const THEME_STACK_GAP:int = 64;

      // a piece of wall just above another of the same slant (a band the
      // den's art draws apart from the wall under it, a rail): it stands on
      // that one's foot, its segments in line with that one's, so a segment
      // goes on up through both. the lowest such wins, a few times over for
      // three or more in a stack.
      private static function stackRuns(param1:Array) : void
      {
         var _loc2_:int = 0;
         var _loc3_:Boolean = false;
         var _loc4_:Array = null;
         var _loc5_:Array = null;
         var _loc6_:Array = null;
         var _loc7_:Number = NaN;
         var _loc8_:Number = NaN;
         while(_loc2_ < 8)
         {
            _loc3_ = false;
            for each(_loc4_ in param1)
            {
               _loc6_ = null;
               for each(_loc5_ in param1)
               {
                  if(_loc5_ == _loc4_ || _loc5_[4] != _loc4_[4])
                  {
                     continue;
                  }
                  // overlapping by a third of the narrower one
                  if(Math.min(_loc4_[0] + _loc4_[2],_loc5_[0] + _loc5_[2]) - Math.max(_loc4_[0],_loc5_[0]) < Math.min(_loc4_[2],_loc5_[2]) / 3)
                  {
                     continue;
                  }
                  // its top just under this one's foot, at this one's left end
                  _loc7_ = _loc5_[7] + _loc5_[4] * (_loc4_[0] - _loc5_[0]) - _loc4_[5];
                  if(_loc7_ >= -8 && _loc7_ <= THEME_STACK_GAP && (_loc6_ == null || _loc5_[5] + _loc5_[4] * (_loc4_[0] - _loc5_[0]) > _loc6_[5] + _loc6_[4] * (_loc4_[0] - _loc6_[0])))
                  {
                     _loc6_ = _loc5_;
                  }
               }
               if(_loc6_ != null)
               {
                  _loc8_ = _loc6_[5] + _loc6_[4] * (_loc4_[0] - _loc6_[0]);
                  if(_loc8_ > _loc4_[5] + 1)
                  {
                     _loc4_[5] = _loc8_;
                     _loc4_[6] = _loc6_[6];
                     _loc3_ = true;
                  }
               }
            }
            if(!_loc3_)
            {
               break;
            }
            _loc2_++;
         }
      }

      // one piece of wall (`param2` its colour in `param1`, `param3` its
      // bounds): its columns' slants, as full-size runs into `param4`
      private static function pieceRuns(param1:BitmapData, param2:uint, param3:Rectangle, param4:Array) : void
      {
         var _loc5_:int = int(param3.width);
         var _loc6_:Array = [];
         var _loc7_:Array = [];
         var _loc8_:int = 0;
         var _loc9_:int = 0;
         var _loc10_:int = 0;
         var _loc11_:int = 0;
         var _loc12_:int = 5;
         var _loc13_:Array = [];
         var _loc14_:int = 0;
         var _loc15_:int = 0;
         var _loc16_:Number = 0;
         var _loc17_:Array = [];
         var _loc18_:Array = null;
         var _loc19_:int = 0;
         // the top and bottom of the piece in each column (-1 for none)
         while(_loc8_ < _loc5_)
         {
            _loc10_ = -1;
            _loc11_ = -1;
            _loc9_ = int(param3.y);
            while(_loc9_ < param3.bottom)
            {
               if(param1.getPixel32(param3.x + _loc8_,_loc9_) == param2)
               {
                  if(_loc10_ < 0)
                  {
                     _loc10_ = _loc9_;
                  }
                  _loc11_ = _loc9_;
               }
               _loc9_++;
            }
            _loc6_.push(_loc10_);
            _loc7_.push(_loc11_);
            _loc8_++;
         }
         // most pieces are one wall: the middling slant of all their edges
         // (rough tops do not sway it) is theirs, all across
         var _loc20_:Array = [];
         _loc8_ = 0;
         while(_loc8_ < _loc5_)
         {
            _loc14_ = Math.max(0,_loc8_ - _loc12_);
            _loc15_ = Math.min(_loc5_ - 1,_loc8_ + _loc12_);
            if(_loc15_ > _loc14_ && _loc6_[_loc14_] >= 0 && _loc6_[_loc15_] >= 0)
            {
               _loc20_.push((_loc6_[_loc15_] - _loc6_[_loc14_]) / (_loc15_ - _loc14_));
               _loc20_.push((_loc7_[_loc15_] - _loc7_[_loc14_]) / (_loc15_ - _loc14_));
            }
            _loc8_++;
         }
         _loc20_.sort(Array.NUMERIC);
         _loc16_ = _loc20_.length > 0 ? Number(_loc20_[int(_loc20_.length / 2)]) : 0;
         if(Math.abs(_loc16_) >= 0.3)
         {
            param4.push([param3.x * THEME_STEP,param3.y * THEME_STEP,_loc5_ * THEME_STEP,param3.height * THEME_STEP,_loc16_ > 0 ? THEME_SLANT : -THEME_SLANT,
               footAt(_loc7_,0,_loc5_,_loc16_ > 0 ? THEME_SLANT : -THEME_SLANT),param3.x * THEME_STEP,footAt(_loc6_,0,_loc5_,_loc16_ > 0 ? THEME_SLANT : -THEME_SLANT) - THEME_STEP]);
            return;
         }
         // else two walls meeting (or a wall straight on): each column's
         // slant, from the edges either side of it
         _loc8_ = 0;
         while(_loc8_ < _loc5_)
         {
            _loc14_ = Math.max(0,_loc8_ - _loc12_);
            _loc15_ = Math.min(_loc5_ - 1,_loc8_ + _loc12_);
            _loc16_ = 0;
            if(_loc15_ > _loc14_ && _loc6_[_loc14_] >= 0 && _loc6_[_loc15_] >= 0)
            {
               _loc16_ = (_loc6_[_loc15_] - _loc6_[_loc14_] + _loc7_[_loc15_] - _loc7_[_loc14_]) / (2 * (_loc15_ - _loc14_));
            }
            _loc13_.push(_loc16_ < -THEME_SLANT * 0.5 ? -THEME_SLANT : (_loc16_ > THEME_SLANT * 0.5 ? THEME_SLANT : 0));
            _loc8_++;
         }
         // the most common slant near each column: rough edges (a window, a
         // torn corner) do not turn the wall
         _loc8_ = 0;
         while(_loc8_ < _loc5_)
         {
            _loc18_ = [0,0,0];
            _loc9_ = Math.max(0,_loc8_ - 8);
            while(_loc9_ <= Math.min(_loc5_ - 1,_loc8_ + 8))
            {
               _loc18_[_loc13_[_loc9_] < 0 ? 0 : (_loc13_[_loc9_] > 0 ? 2 : 1)]++;
               _loc9_++;
            }
            _loc17_.push(_loc18_[0] > _loc18_[1] && _loc18_[0] >= _loc18_[2] ? -THEME_SLANT : (_loc18_[2] > _loc18_[1] ? THEME_SLANT : 0));
            _loc8_++;
         }
         // runs of one slant, full size
         _loc8_ = 1;
         while(_loc8_ <= _loc5_)
         {
            if(_loc8_ == _loc5_ || _loc17_[_loc8_] != _loc17_[_loc19_])
            {
               param4.push([(param3.x + _loc19_) * THEME_STEP,param3.y * THEME_STEP,(_loc8_ - _loc19_) * THEME_STEP,param3.height * THEME_STEP,_loc17_[_loc19_],
                  footAt(_loc7_,_loc19_,_loc8_,_loc17_[_loc19_]),(param3.x + _loc19_) * THEME_STEP,footAt(_loc6_,_loc19_,_loc8_,_loc17_[_loc19_]) - THEME_STEP]);
               _loc19_ = _loc8_;
            }
            _loc8_++;
         }
      }

      // the foot of a wall, full size, at the left of its columns `param2`
      // to `param3` (of `param1`, each column's lowest wall pixel, at a
      // quarter size, -1 for none), slanted `param4`: the middling one of
      // the foot each column puts there, so a ragged bit does not move it.
      // given each column's highest pixel, less a quarter-size step, it is
      // the wall's top (its head) the same way
      private static function footAt(param1:Array, param2:int, param3:int, param4:Number) : Number
      {
         var _loc5_:Array = [];
         var _loc6_:int = param2;
         while(_loc6_ < param3)
         {
            if(param1[_loc6_] >= 0)
            {
               _loc5_.push(param1[_loc6_] - param4 * (_loc6_ - param2));
            }
            _loc6_++;
         }
         if(_loc5_.length == 0)
         {
            return 0;
         }
         _loc5_.sort(Array.NUMERIC);
         return (Number(_loc5_[int(_loc5_.length / 2)]) + 1) * THEME_STEP;
      }

      // the light and shade laid over the picture, from the shape of the
      // walls (or floor) alone, so nothing of the base's own picture shows
      // through it: each stretch of wall lighter at its top line and darker
      // at its foot, along its slant (`param3`, wallRuns; null for a floor,
      // one even tone), darker towards every edge (the outline blurred), as
      // a grey about the middle laid over; then the base's exact outline and
      // a thin dark edge inside it, as every den piece has
      private static const SHADE_TOP:int = 168;

      private static const SHADE_MID:int = 140;

      private static const SHADE_FOOT:int = 96;

      private static const SHADE_FLOOR:int = 140;

      private static const SHADE_RIM_BLUR:int = 24;

      // how dark the very edge is, as a part of the tone further in
      private static const SHADE_RIM_LOW:Number = 0.55;

      private static function grey(param1:int) : uint
      {
         return param1 << 16 | param1 << 8 | param1;
      }

      private static function themeShade(param1:BitmapData, param2:BitmapData, param3:Array) : void
      {
         var _loc4_:BitmapData = new BitmapData(param2.width,param2.height,false,grey(param3 == null ? SHADE_FLOOR : 128));
         var _loc5_:Shape = null;
         var _loc6_:Matrix = null;
         var _loc7_:BitmapData = null;
         var _loc8_:Point = new Point(0,0);
         if(param3 != null)
         {
            _loc5_ = new Shape();
            for each(var _loc9_:Array in param3)
            {
               // top line to foot line, its rows along the slant:
               // y' = y + slant * (x - left)
               _loc6_ = new Matrix();
               _loc6_.createGradientBox(Math.max(1,_loc9_[2]),Math.max(8,_loc9_[5] - _loc9_[7]),Math.PI / 2,_loc9_[0],_loc9_[7]);
               _loc6_.concat(new Matrix(1,_loc9_[4],0,1,0,-_loc9_[4] * _loc9_[0]));
               _loc5_.graphics.beginGradientFill("linear",[grey(SHADE_TOP),grey(SHADE_MID),grey(SHADE_FOOT)],[1,1,1],[0,153,255],_loc6_,"pad");
               _loc5_.graphics.drawRect(_loc9_[0],_loc9_[1],_loc9_[2],_loc9_[3]);
               _loc5_.graphics.endFill();
            }
            _loc4_.draw(_loc5_);
         }
         // the rim: the outline, blurred, from SHADE_RIM_LOW at the edge to
         // nothing further in
         _loc7_ = new BitmapData(param2.width,param2.height,false,0);
         _loc7_.copyChannel(param2,_loc7_.rect,_loc8_,8,1);
         _loc7_.copyChannel(param2,_loc7_.rect,_loc8_,8,2);
         _loc7_.copyChannel(param2,_loc7_.rect,_loc8_,8,4);
         _loc7_.applyFilter(_loc7_,_loc7_.rect,_loc8_,new BlurFilter(SHADE_RIM_BLUR,SHADE_RIM_BLUR,2));
         _loc7_.colorTransform(_loc7_.rect,new ColorTransform(1 - SHADE_RIM_LOW,1 - SHADE_RIM_LOW,1 - SHADE_RIM_LOW,1,SHADE_RIM_LOW * 255,SHADE_RIM_LOW * 255,SHADE_RIM_LOW * 255,0));
         _loc4_.draw(_loc7_,null,null,"multiply");
         _loc7_.dispose();
         param1.draw(_loc4_,null,null,"overlay");
         _loc4_.dispose();
         param1.copyChannel(param2,param1.rect,_loc8_,8,8);
         param1.applyFilter(param1,param1.rect,_loc8_,new GlowFilter(0,0.45,5,5,2,2,true));
      }

      private function onUniqueImageIdLoaded(param1:Sprite) : void
      {
         if(_masterpieceDefHelper)
         {
            _masterpieceDefHelper.destroy();
            _masterpieceDefHelper = null;
         }
         if(_uniqueImage)
         {
            _uniqueImage.addChild(param1);
            if(_loader && _loader.content && "setUniqueImage" in _loader.content)
            {
               MovieClip(_loader.content).setUniqueImage(_uniqueImage);
            }
         }
      }
      
      private function onEmoteItemClicked(param1:int) : void
      {
         if(AvatarManager.playerAvatarWorldView && !AvatarManager.playerAvatarWorldView.isThisAttachmentOn(param1))
         {
            AvatarManager.setPlayerAttachmentEmot(param1);
         }
      }
      
      private function onMouseDown(param1:MouseEvent) : void
      {
         if(_onMouseDownCallback != null)
         {
            _onMouseDownCallback(param1,this);
         }
      }
      
      private function onMouseOver(param1:MouseEvent) : void
      {
         if(_onMouseOverCallback != null)
         {
            _onMouseOverCallback(param1,this);
         }
      }
      
      private function onMouseOut(param1:MouseEvent) : void
      {
         if(_onMouseOutCallback != null)
         {
            _onMouseOutCallback(param1);
         }
      }
   }
}

