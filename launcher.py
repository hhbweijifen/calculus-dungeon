#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
微积分地牢：史诗版 - Python 启动器
自动将模块化项目打包为单个 HTML 文件并启动浏览器
"""
import os
import sys
import webbrowser

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def read_files(folder, ext):
    """读取文件夹下所有指定扩展名的文件，按文件名排序"""
    files = []
    folder_path = os.path.join(BASE_DIR, folder)
    if not os.path.exists(folder_path):
        return ""
    for fname in sorted(os.listdir(folder_path)):
        if fname.endswith(ext):
            fpath = os.path.join(folder_path, fname)
            try:
                with open(fpath, 'r', encoding='utf-8') as f:
                    files.append(f"/* ===== {fname} ===== */\n" + f.read())
            except Exception as e:
                print(f"警告: 读取 {fname} 失败: {e}")
    return "\n\n".join(files)

def build():
    """构建单文件 HTML"""
    # 读取 HTML 框架
    html_path = os.path.join(BASE_DIR, "index.html")
    with open(html_path, 'r', encoding='utf-8') as f:
        html = f.read()

    # 读取 CSS
    css_content = read_files("css", ".css")

    # 读取 JS
    js_content = read_files("js", ".js")

    # 替换占位符
    if "<!-- CSS_PLACEHOLDER -->" in html:
        css_tag = f"<style>\n{css_content}\n</style>" if css_content else ""
        html = html.replace("<!-- CSS_PLACEHOLDER -->", css_tag)
    else:
        # 如果没有占位符，在 </head> 前插入
        css_tag = f"<style>\n{css_content}\n</style>"
        html = html.replace("</head>", css_tag + "\n</head>")

    if "<!-- JS_PLACEHOLDER -->" in html:
        js_tag = f"<script>\n{js_content}\n</script>" if js_content else ""
        html = html.replace("<!-- JS_PLACEHOLDER -->", js_tag)
    else:
        # 如果没有占位符，在 </body> 前插入
        js_tag = f"<script>\n{js_content}\n</script>"
        html = html.replace("</body>", js_tag + "\n</body>")

    # 保存
    output_name = "微积分地牢-史诗版.html"
    output_path = os.path.join(BASE_DIR, output_name)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html)

    size = os.path.getsize(output_path)
    print(f"[OK] 构建成功: {output_path}")
    print(f"[INFO] 文件大小: {size:,} 字节 ({size/1024:.1f} KB)")
    return output_path

def main():
    print("=" * 50)
    print("微积分地牢：史诗版 启动器")
    print("=" * 50)
    print("正在打包资源...")

    output_path = build()

    print("\n正在启动浏览器...")
    webbrowser.open(f"file:///{output_path}")

    print("\n提示:")
    print(f"   - 游戏文件: {os.path.basename(output_path)}")
    print("   - 直接双击该 HTML 文件也能运行")
    print("   - 修改 css/ 或 js/ 中的文件后，重新运行 launcher.py 即可更新")

    input("\n按 Enter 键退出...")

if __name__ == '__main__':
    main()
