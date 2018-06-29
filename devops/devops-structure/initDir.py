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
# return menu id
def returnTableId(table, content, equaldata):
    sql = "select id from {table} where {content} = '{equaldata}'".format(table=table,content=content, equaldata=equaldata)
    cursor.execute(sql)
    Id = cursor.fetchone()
    return Id
# judge menu exist
def judgeTrue(table, code, level):
    sql = "select id from {table} where code='{code}' and level='{level}' and type='dir'".format(
        table=table,
        code=code,
        level=level)
    cursor.execute(sql)
    count = cursor.execute(sql)
    parent_id = cursor.fetchone()
    # print count
    if parent_id:
        return parent_id["id"]
    else:
        return 0

def getParentId(table, code, level):
    sql = "select id from {table} where code='{code}' and level='{level}'".format(
        table=table,
        code=code,
        level=level)
    cursor.execute(sql)
    count = cursor.execute(sql)
    parent_id = cursor.fetchone()
    if parent_id:
        return parent_id["id"]
    else:
        return 0

# insert iam_menu
def selectMenuTable(table, data):
    try:
        dirMenu = data
        for dir in data:
            dirId = judgeTrue(table, dir["code"], dir["level"]);
            if dirId == 0:
                parent = getParentId(table, dir["parent"], dir["level"])
                sql = "insert into {table} (code, name, level, parent_id, type, is_default, icon, sort) values ('{code}', '{name}', '{level}', {parent_id}, 'dir', 0, '{icon}', '{sort}')".format(
                          table=table,
                          code=dir["code"],
                          name=dir["name"],
                          level=dir["level"],
                          icon=dir["icon"],
                          sort=dir["sort"],
                          parent_id=parent)
                cursor.execute(sql)
                dirId = cursor.lastrowid
                sql = "insert into iam_menu_tl (id, lang, name) values ('{id}', '{lang}', '{name}')".format(
                    id=dirId,
                    lang="zh_CN",
                    name=dir["name"]
                )
                cursor.execute(sql)
                sql = "insert into iam_menu_tl (id, lang, name) values ('{id}', '{lang}', '{name}')".format(
                    id=dirId,
                    lang="en_US",
                    name=dir["enName"]
                )
                cursor.execute(sql)                
            for sub in dir["subMenu"]:
                sql = "update {table} set parent_id = {dir_id} where code='{subCode}'".format(
                    table=table,
                    dir_id=dirId,
                    subCode=sub)
                cursor.execute(sql)
    except:
        dealFault()
def dealFault():
    traceback.print_exc()
    db.rollback()
def close():
    cursor.close()
    db.close()
if __name__ == '__main__':
    baseDirs = os.path.abspath(os.path.join(os.path.dirname("__file__")))
    wholeConfig = '{baseDirs}/dirMenu.yml'.format(baseDirs=baseDirs);
    ymlFile = open(wholeConfig)
    contentConfig = yaml.load(ymlFile)
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
    selectMenuTable('iam_menu', contentConfig)
    ymlFile.close()