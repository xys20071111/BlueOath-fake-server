# -*- coding: utf-8 -*-

import sqlite3
import os
import glob

# --- 配置 ---
# 设置你的数据库文件所在的目录。'.' 代表当前目录。
SOURCE_DIRECTORY = '.' 
# 设置数据库文件的扩展名。脚本会查找所有以此结尾的文件。
DB_EXTENSION = '.db' 

def decode_data_to_json(encoded_bytes: bytes) -> str:
    """
    根据反汇编代码的逻辑，解密字节数据并将其转换为JSON字符串。
    (这个函数与我们之前创建的完全相同)
    """
    if not encoded_bytes:
        return "" # 如果数据为空，则返回空字符串
        
    key = 0x55
    decoded_data = bytearray(encoded_bytes)
    
    for i in range(len(decoded_data)):
        decoded_data[i] ^= key
        
    try:
        json_string = decoded_data.decode('utf-8')
        return json_string
    except UnicodeDecodeError:
        # 如果解码失败，可能意味着数据不是预期的格式或已损坏
        # 返回一个错误提示，而不是让整个程序崩溃
        return '{"error": "UnicodeDecodeError", "message": "Failed to decode bytes after XOR."}'

def process_database(db_path: str):
    """
    处理单个SQLite数据库文件。
    - 创建输出文件夹。
    - 连接源数据库，提取DDL和所有数据。
    - 创建同结构的新数据库，将解密后的数据存入其中。
    """
    print(f"\n--- 正在处理数据库: {db_path} ---")
    
    # 1. 创建输出目录
    db_filename = os.path.basename(db_path)
    output_dir = os.path.join(SOURCE_DIRECTORY, 'decrypted')
    
    try:
        os.makedirs(output_dir, exist_ok=True)
        print(f"输出文件夹: '{output_dir}'")
    except OSError as e:
        print(f"错误：无法创建文件夹 '{output_dir}'. 原因: {e}")
        return

    # 2. 连接源数据库并提取DDL和数据
    src_conn = None
    dst_conn = None
    try:
        src_conn = sqlite3.connect(db_path)
        src_cursor = src_conn.cursor()
        
        # 获取数据库的完整DDL（先表后索引）
        src_cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' ORDER BY name")
        tables_ddl = src_cursor.fetchall()
        src_cursor.execute("SELECT sql FROM sqlite_master WHERE type='index' ORDER BY name")
        indexes_ddl = src_cursor.fetchall()
        
        # 3. 创建解密后的数据库
        output_db_path = os.path.join(output_dir, db_filename)
        dst_conn = sqlite3.connect(output_db_path)
        dst_cursor = dst_conn.cursor()
        
        # 执行DDL创建表结构和索引
        for (ddl_sql,) in tables_ddl + indexes_ddl:
            if ddl_sql:
                dst_cursor.execute(ddl_sql)
        dst_conn.commit()
        print(f"已创建解密数据库: '{output_db_path}'")
        
        # 4. 查询所有数据
        src_cursor.execute('SELECT id, indexid, jsonbytes FROM DBObject')
        rows = src_cursor.fetchall()
        
        if not rows:
            print("警告: 在此数据库中未找到任何数据。")
            return
            
        print(f"发现 {len(rows)} 条记录，开始解密并写入...")
        
        # 5. 遍历每一行数据，解密后写入新数据库
        count = 0
        for row in rows:
            file_id, indexid, blob_data = row
            
            json_content = decode_data_to_json(blob_data)
            
            dst_cursor.execute(
                'INSERT OR REPLACE INTO DBObject (id, indexid, jsonbytes) VALUES (?, ?, ?)',
                (file_id, indexid, json_content.encode('utf-8') if json_content else b'')
            )
            count += 1
        
        dst_conn.commit()
        print(f"成功解密并写入 {count} 条记录。")

    except sqlite3.Error as e:
        print(f"数据库错误: {e}")
    finally:
        if src_conn:
            src_conn.close()
        if dst_conn:
            dst_conn.close()

def main():
    """
    主函数，查找并处理所有数据库文件。
    """
    print("开始执行JSON数据提取脚本...")
    # 查找指定目录下的所有匹配扩展名的数据库文件
    search_pattern = os.path.join(SOURCE_DIRECTORY, f'*{DB_EXTENSION}')
    db_files = glob.glob(search_pattern)
    
    if not db_files:
        print(f"在 '{SOURCE_DIRECTORY}' 目录中未找到任何 '{DB_EXTENSION}' 文件。")
        return
        
    print(f"共找到 {len(db_files)} 个数据库文件。")
    
    for db_file in db_files:
        process_database(db_file)
        
    print("\n--- 所有任务处理完毕 ---")

if __name__ == "__main__":
    main()