#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
微积分地牢：史诗版 - 本地服务器
在局域网内启动一个HTTP服务器，支持手机/其他设备访问
同时支持PWA安装（需要HTTP/HTTPS协议）
"""
import os
import sys
import socket
import webbrowser
from http.server import HTTPServer, SimpleHTTPRequestHandler

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PORT = 8080

class MyHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # 允许跨域访问，支持PWA
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()
    
    def log_message(self, format, *args):
        # 简化日志输出
        print(f"[{self.address_string()}] {args[0]}")

def get_local_ip():
    """获取本机局域网IP地址"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def main():
    os.chdir(BASE_DIR)
    
    local_ip = get_local_ip()
    
    print("=" * 55)
    print("  🎮 微积分地牢：史诗版 - 本地服务器")
    print("=" * 55)
    print()
    print(f"  📱 本机访问:    http://localhost:{PORT}")
    print(f"  🌐 局域网访问:  http://{local_ip}:{PORT}")
    print()
    print("  💡 提示:")
    print("     • 手机和电脑需要在同一个WiFi下")
    print("     • 用手机浏览器访问上面的局域网地址")
    print("     • 可以将游戏添加到手机主屏幕（像App一样）")
    print("     • 按 Ctrl+C 停止服务器")
    print()
    print("=" * 55)
    
    # 自动打开浏览器
    try:
        webbrowser.open(f"http://localhost:{PORT}")
    except Exception:
        pass
    
    server = HTTPServer(("0.0.0.0", PORT), MyHandler)
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n\n服务器已停止。")
        sys.exit(0)

if __name__ == '__main__':
    main()
