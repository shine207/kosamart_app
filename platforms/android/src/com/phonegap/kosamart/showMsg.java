package com.plugin.gcm;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.Context;
import android.os.Bundle;
import android.view.Window;
import android.view.WindowManager;
import android.provider.Settings;
import java.util.*;
 
public class showMsg extends Activity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);

        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
         
        getWindow().addFlags(
                              WindowManager.LayoutParams.FLAG_FULLSCREEN |
                              WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
                              WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
                              //WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD
                              );

        PushWakeLock.acquireCpuWakeLock(this);
         
        String title, msg;
        Bundle bun = getIntent().getExtras();
        title = bun.getString("title");
        msg = bun.getString("message");
        final Context ct = this;

        final Intent notificationIntent = new Intent(this, PushHandlerActivity.class);
        notificationIntent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        notificationIntent.putExtra("pushBundle", bun);
     
        AlertDialog.Builder alertDialog = new AlertDialog.Builder(showMsg.this);
         
        alertDialog.setPositiveButton("닫기", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                PushWakeLock.releaseCpuLock();
                showMsg.this.finish();
            }
        });
         
        alertDialog.setNegativeButton("보기", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {

                startActivity(notificationIntent);
                PushWakeLock.releaseCpuLock();
                showMsg.this.finish();
            }
        });
         
        alertDialog.setTitle(title);
        alertDialog.setMessage(msg);
        alertDialog.show();
 
        // 폰 설정의 조명시간을 가져와서 해당 시간만큼만 화면을 켠다.
        int defTimeOut = Settings.System.getInt(getContentResolver(), Settings.System.SCREEN_OFF_TIMEOUT, 15000);
        TimerTask task = new TimerTask() {
                 @Override
                public void run() {
                      showMsg.this.finish();
                        PushWakeLock.releaseCpuLock();
                }
        };
             
        Timer timer = new Timer();
        timer.schedule(task, defTimeOut);
    }
}
