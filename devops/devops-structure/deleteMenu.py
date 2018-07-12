#!/usr/bin/env python
# -*- coding: utf-8 -*-
import pymysql
import os
import yaml
import traceback
import sys
import getopt
reload(sys)
sys.setdefaultencoding('utf8')

def deleteMenu(table, column, id):
    sql = "delete from {table} where {column}='{id}'".format(
         table=table,
         column=column,
         id=id);
    cursor.execute(sql)

# delete menu
def deleteMenuTable():
    try:
        sql = "SELECT id FROM `iam_menu` WHERE code LIKE 'choerodon.code.devops%'";
        cursor.execute(sql);
        ids = cursor.fetchall();
        for id in ids:
            if id:
                deleteMenu("iam_menu", "id", id["id"])
                deleteMenu("iam_menu_tl", "id", id["id"])
                deleteMenu("iam_menu_permission", "menu_id", id["id"])
    except:
        dealFault() 

def dealFault():
    traceback.print_exc()
    db.rollback()
def close():
    cursor.close()
    db.close()
if __name__ == '__main__':
    host=os.environ.get('DB_HOST')
    port=os.environ.get('DB_PORT')
    user=os.environ.get('DB_USER')
    passwd=os.environ.get('DB_PASS')
    try:
        options,args = getopt.getopt(sys.argv[1:],"p:i:u:s:", ["ip=","port=","user=","secret="])
    except getopt.GetoptError:
        sys.exit()
    for name,value in options:
        if name in ("-i","--ip"):
            host=value
        if name in ("-p","--port"):
            port=value
        if name in ("-u","--user"):
            user=value
        if name in ("-s","--secret"):
            passwd=value
    config = {
        'host': host,
        'port': int(port),
        'user': user,
        'passwd': passwd,
        'charset':'utf8',
        'cursorclass':pymysql.cursors.DictCursor
        }
    db = pymysql.connect(**config)
    db.autocommit(1)
    cursor = db.cursor()
    DB_NAME = os.getenv("DB_NAME", "iam_service")
    db.select_db(DB_NAME)
    deleteMenuTable()
