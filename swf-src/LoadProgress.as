package loadProgress
{
   import com.sbi.loader.LoaderCacheEntry_Base;
   import com.sbi.loader.LoaderEvent;
   import com.sbi.loader.SwfImports;
   import flash.display.DisplayObjectContainer;
   import flash.display.Loader;
   import flash.display.MovieClip;
   import flash.events.Event;
   import flash.net.URLLoader;
   import flash.net.URLRequest;
   import flash.net.SharedObject;
   import flash.system.Capabilities;
   import flash.system.ApplicationDomain;
   import flash.system.LoaderContext;
   import flash.utils.ByteArray;
   import flash.utils.getDefinitionByName;
   import localization.LocalizationManager;
   
   public class LoadProgress
   {
      
      public static const INITIALIZING:int = 2;
      
      public static const LOAD_RESOURCES:int = 3;
      
      public static const INIT_GAMEPLAY_OR_CREATE_ACCOUNT:int = 4;
      
      public static const LOGGING_IN:int = 5;
      
      public static const ON_LOGIN:int = 6;
      
      public static const INIT_ASSETS:int = 7;
      
      public static const LOADING_WORLDMAP:int = 8;
      
      public static const SCENE_INIT:int = 9;
      
      public static const LOADING_ROOM_OR_SERVER_JOIN:int = 10;
      
      public static const LIST_TOP_LOAD_TEXT_ID:int = 697;
      
      public static const LIST_BOTTOM_LOAD_TEXT_ID:int = 694;
      
      public static const LIST_PROGRESS_TEXT_ID:int = 696;
      
      private static var _entry:LoaderCacheEntry_Base;
      
      private static var _loadScreen:Loader;
      
      private static var _loadScreenContent:LoadProgressContent;

      private static var _loadContext:LoaderContext;

      private static var _screenStripped:Boolean = false;

      private static var _screenGiven:Boolean = false;

      private static var _screenFetching:Boolean = false;

      // which loading screen was last asked for: a fetch that comes back
      // after another was asked for is dropped
      private static var _screenAsk:int = 0;
      
      private static var _loadLayer:DisplayObjectContainer;
      
      private static var _completeCallback:Function;
      
      private static var _target:String;
      
      private static var _bChangeLoadingScreen:Boolean;
      
      private static var _progressCounter:int;
      
      private static var _visible:Boolean;
      
      
      public function LoadProgress()
      {
         super();
      }
      
      public static function get loadScreen() : Loader
      {
         return _loadScreen;
      }
      
      public static function get entry() : LoaderCacheEntry_Base
      {
         return _entry;
      }
      
      public static function get loadLayer() : DisplayObjectContainer
      {
         return _loadLayer;
      }
      
      public static function get visible() : Boolean
      {
         return _visible;
      }
      
      public static function init(param1:DisplayObjectContainer) : void
      {
         var _loc2_:LoaderContext = null;
         if(_loadScreen == null)
         {
            _bChangeLoadingScreen = true;
            _progressCounter = 0;
            _loadLayer = param1;
            _loadScreen = new Loader();
            _loc2_ = new LoaderContext();
            // Burrow: on every player, as the Flash plugin had it by default
            // (Ruffle may not)
            _loc2_.allowCodeImport = true;
            _loadScreen.contentLoaderInfo.addEventListener("complete",onLoadScreenComplete);
            // Burrow: the screen's bytes (loadScreenBytes). in a browser
            // their empty import of sharedFonts.swf is taken out first, or
            // they never finish loading (com.sbi.loader.SwfImports). this
            // comes before the start values do, so the movie's own
            // parameters say whether it is in a browser.
            _loadContext = _loc2_;
            try
            {
               SwfImports.noteParameters(param1.loaderInfo.parameters);
            }
            catch(e:Error)
            {
            }
            try
            {
               SwfImports.noteParameters(param1.stage.getChildAt(0).loaderInfo.parameters);
            }
            catch(e:Error)
            {
            }
            loadScreenBytes();
         }
      }

      // the loading screen's bytes: the embedded copy, or the server's when
      // that cannot be found (fetchScreen). if the browser was not known yet
      // when they were given, they are given again, stripped, when the screen
      // is next shown and is not there yet (show).
      private static function loadScreenBytes() : void
      {
         _screenAsk++;
         // the older art, picked in Settings: only the server has it
         if(oldScreenOn())
         {
            fetchScreen("loadScreenOld.swf",true);
            return;
         }
         var _loc1_:ByteArray = screenBytes();
         if(_loc1_ == null)
         {
            fetchScreen("loadScreen.swf",false);
            return;
         }
         giveScreen(_loc1_);
      }

      // the older loading screen (Settings, "Loading screen"), kept on this
      // computer: it is up before anyone has logged in
      public static function oldScreenOn() : Boolean
      {
         try
         {
            return SharedObject.getLocal("loadScreen","/").data.old == true;
         }
         catch(e:Error)
         {
         }
         return false;
      }

      // ... picked or not: kept, and the screen swapped at once when it is not
      // up (else from the next start)
      public static function setOldScreen(param1:Boolean) : void
      {
         try
         {
            var _loc2_:SharedObject = SharedObject.getLocal("loadScreen","/");
            _loc2_.data.old = param1;
            _loc2_.flush();
         }
         catch(e:Error)
         {
         }
         if(_loadScreen == null || _visible)
         {
            return;
         }
         _loadScreenContent = null;
         _bChangeLoadingScreen = true;
         try
         {
            _loadScreen.unloadAndStop();
         }
         catch(e:Error)
         {
         }
         loadScreenBytes();
      }

      private static function giveScreen(param1:ByteArray) : void
      {
         _screenGiven = true;
         _screenStripped = SwfImports.active;
         try
         {
            _loadScreen.loadBytes(SwfImports.strip(param1),_loadContext);
         }
         catch(e:Error)
         {
         }
      }

      // Burrow: in this rebuilt client Ruffle never finds the embedded
      // screen's class (#1065, by any of the ways in screenBytes), so the same
      // file is fetched from the server the client itself came from
      // (lib/http.js, /gameClient/loadScreen.swf), once. failing, there is
      // no loading screen; the game loads all the same.
      // param1: the file under /gameClient/. param2: failing, the usual
      // screen is given instead (the older one, when the server has none).
      private static function fetchScreen(param1:String, param2:Boolean) : void
      {
         var _loc1_:URLLoader = null;
         var _loc2_:String = null;
         var _loc3_:int = 0;
         var _loc4_:int = _screenAsk;
         var failed:Function = null;
         if(_screenFetching && !param2)
         {
            return;
         }
         _screenFetching = true;
         failed = function(param1:Event = null):void
         {
            _screenFetching = false;
            if(param2 && _loc4_ == _screenAsk)
            {
               var _loc5_:ByteArray = screenBytes();
               if(_loc5_ != null)
               {
                  giveScreen(_loc5_);
               }
               else
               {
                  fetchScreen("loadScreen.swf",false);
               }
            }
         };
         try
         {
            _loc2_ = _loadLayer.stage.getChildAt(0).loaderInfo.url;
            _loc3_ = _loc2_.indexOf("/",_loc2_.indexOf("//") + 2);
            _loc2_ = (_loc3_ > 0 ? _loc2_.substring(0,_loc3_) : _loc2_) + "/gameClient/" + param1;
            _loc1_ = new URLLoader();
            _loc1_.dataFormat = "binary";
            _loc1_.addEventListener("complete",function(param1:Event):void
            {
               _screenFetching = false;
               if(_loc4_ == _screenAsk)
               {
                  giveScreen(ByteArray(_loc1_.data));
               }
            });
            _loc1_.addEventListener("ioError",failed);
            _loc1_.addEventListener("securityError",failed);
            _loc1_.load(new URLRequest(_loc2_));
         }
         catch(e:Error)
         {
            failed();
         }
      }

      // the embedded loading screen (Load_Screen_swf), or null. found by
      // name, not named in a static constant as the game had it: compiled
      // again here, this class is set up before that one is there (#1065).
      private static function screenBytes() : ByteArray
      {
         var _loc1_:Class = null;
         try
         {
            _loc1_ = getDefinitionByName("Load_Screen_swf") as Class;
         }
         catch(e:Error)
         {
         }
         if(_loc1_ == null)
         {
            try
            {
               _loc1_ = ApplicationDomain.currentDomain.getDefinition("Load_Screen_swf") as Class;
            }
            catch(e:Error)
            {
            }
         }
         if(_loc1_ == null && _loadLayer && _loadLayer.stage)
         {
            try
            {
               _loc1_ = _loadLayer.stage.getChildAt(0).loaderInfo.applicationDomain.getDefinition("Load_Screen_swf") as Class;
            }
            catch(e:Error)
            {
            }
         }
         if(_loc1_ == null)
         {
            try
            {
               _loc1_ = Load_Screen_swf;
            }
            catch(e:Error)
            {
            }
         }
         return _loc1_ ? new _loc1_() as ByteArray : null;
      }

      public static function show(param1:Boolean, param2:Object = null) : void
      {
         if(param1)
         {
            _visible = true;
            if(!_loadScreenContent && _screenGiven && !_screenStripped && SwfImports.active && _loadScreen)
            {
               loadScreenBytes();
            }
            if(!loadLayer.contains(_loadScreen))
            {
               loadLayer.addChild(_loadScreen);
            }
            if(_loadScreenContent && _bChangeLoadingScreen)
            {
               _loadScreenContent.showScreen(true);
               _loadScreenContent.setProgress(_progressCounter);
               _bChangeLoadingScreen = false;
            }
         }
         else if(loadLayer.contains(_loadScreen))
         {
            _visible = false;
            loadLayer.removeChild(_loadScreen);
            _bChangeLoadingScreen = true;
            _progressCounter = 0;
            if(_loadScreenContent)
            {
               _loadScreenContent.destroyScreens();
            }
         }
      }
      
      public static function updateProgress(param1:int) : void
      {
         _progressCounter = param1;
         if(_loadScreenContent)
         {
            _loadScreenContent.setProgress(param1);
         }
      }
      
      public static function load(param1:String, param2:int, param3:Function) : void
      {
         _entry = null;
         _completeCallback = param3;
         _target = gMainFrame.path + param1;
         _progressCounter = param2;
         if(_loadScreenContent)
         {
            _loadScreenContent.setProgress(param2);
         }
         if(_loadScreen)
         {
            startLoad();
            return;
         }
         throw new Error("preloader was not embedded?!");
      }
      
      public static function onLocalizationsReceived() : void
      {
         if(LocalizationManager.hasLocalizations)
         {
            if(_loadScreenContent)
            {
               _loadScreenContent.updateText();
            }
         }
      }
      
      private static function onLoadScreenComplete(param1:Event) : void
      {
         _loadScreenContent = new LoadProgressContent(MovieClip(_loadScreen.content));
         // Burrow: only if it is still wanted: fetched (fetchScreen), it can
         // come after the game has put it away
         if(_visible)
         {
            show(true);
         }
      }
      
      // Burrow: the loading screen may not be there yet (it is fetched, in a
      // browser) or at all, so there may be no _loadScreenContent: what is
      // loaded is loaded all the same, without its percentage (it threw #1009
      // here, and the game stopped).
      private static function startLoad() : void
      {
         show(true);
         if(_loadScreenContent)
         {
            _loadScreenContent.loadPercentageVisibility = true;
         }
         gMainFrame.loaderCache.openFile(_target,loadCompleteHandler,loadProgressHandler);
      }
      
      private static function loadCompleteHandler(param1:LoaderEvent) : void
      {
         _entry = param1.entry;
         if(_loadScreenContent)
         {
            _loadScreenContent.loadPercentageVisibility = false;
         }
         if(_completeCallback != null)
         {
            _completeCallback();
         }
      }
      
      private static function loadProgressHandler(param1:LoaderEvent) : void
      {
         if(param1.status && _loadScreen)
         {
            if(_loadScreenContent)
            {
               _loadScreenContent.loadPercentage = param1.entry.progress;
            }
            return;
         }
         throw new Error("ERROR: Unable to show loading progress! status:" + param1.status + " preloader:" + _loadScreen);
      }
   }
}

