package cl.entel.plugins;

import android.util.Log;

import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;

public class GtmCorePlugin extends CordovaPlugin {
    private static final String TAG = "GtmCorePlugin";

    @Override
    public void initialize(CordovaInterface cordova, CordovaWebView webView) {
        Log.d(TAG, "Starting GtmCorePlugin");
        super.initialize(cordova, webView);
    }
}