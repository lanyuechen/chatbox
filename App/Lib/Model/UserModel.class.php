<?php

Class UserModel extends MongoModel {
	Protected $pk = 'id';
    Protected $_idType = self::TYPE_INT;
    protected $_autoInc =  true;
}
