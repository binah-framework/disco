{-# LANGUAGE RecordWildCards #-}
{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE DeriveGeneric #-}

{-@ LIQUID "--no-pattern-inline" @-}

module Controllers.User where

import           Data.Text                      ( Text )
import qualified Data.Text                     as T
import           Data.Int                       ( Int64 )
import           Data.Maybe
import           Database.Persist.Sql           ( fromSqlKey
                                                , toSqlKey
                                                )
import           GHC.Generics

import           Binah.Core
import           Binah.Actions
import           Binah.Updates
import           Binah.Insert
import           Binah.Filters
import           Binah.Helpers
import           Binah.Infrastructure
import           Binah.Templates
import           Binah.Frankie

import           Controllers
import           Controllers.Invitation         ( InvitationCode(..) )
import           Model
import           JSON
import           Control.Monad                  ( when )

----------------------------------------------------------------------------------------------------
-- | User List
----------------------------------------------------------------------------------------------------

{-@ userList :: TaggedT<{\_ -> False}, {\_ -> True}> _ _ @-}
userList :: Controller ()
userList = do
  _     <- requireAuthUser
  users <- selectList trueF
  users <- mapT extractUserData users
  respondJSON status200 users

{-@ extractUserData :: _ -> TaggedT<{\_ -> True}, {\_ -> False}> _ _ @-}
extractUserData :: Entity User -> Controller UserData
extractUserData u = do
  visibility <- project userVisibility' u
  UserData
    `fmap` project userId'           u
    <*>    project userEmailAddress' u
    <*>    project userPhotoURL'     u
    <*>    project userDisplayName'  u
    <*>    project userInstitution'  u
    <*>    project userPronouns'     u
    <*>    project userWebsite'      u
    <*>    project userBio'          u
    <*>    project userLevel'        u
    <*>    if visibility == "public" then project userRoom' u else return Nothing

data UserData = UserData
  { userId :: UserId
  , userEmailAddress :: Text
  , userPhotoURL :: Maybe Text
  , userDisplayName :: Text
  , userInstitution :: Text
  , userPronouns :: Text
  , userWebsite :: Text
  , userBio:: Text
  , userLevel :: String
  , userRoom :: Maybe RoomId
  }
  deriving Generic

instance ToJSON UserData where
  toEncoding = genericToEncoding (stripPrefix "user")

----------------------------------------------------------------------------------------------------
-- | User Get
----------------------------------------------------------------------------------------------------

{-@ userGet :: _ -> TaggedT<{\_ -> False}, {\_ -> True}> _ _ @-}
userGet :: UserId -> Controller ()
userGet userId = do
  _        <- requireAuthUser
  user     <- selectFirstOr notFoundJSON (userId' ==. userId)
  userData <- extractUserData user
  respondJSON status200 userData

----------------------------------------------------------------------------------------------------
-- | User Update
----------------------------------------------------------------------------------------------------

{-@ userUpdateMe :: TaggedT<{\_ -> False}, {\_ -> True}> _ _ @-}
userUpdateMe :: Controller ()
userUpdateMe = do
  user               <- requireAuthUser
  userId             <- project userId' user
  uu@UserUpdate {..} <- decodeBody
  validateUser uu
  let up =
        (userPhotoURL' `assign` userUpdatePhotoURL)
          `combine` (userDisplayName' `assign` userUpdateDisplayName)
          `combine` (userInstitution' `assign` userUpdateInstitution)
          `combine` (userPronouns' `assign` userUpdatePronouns)
          `combine` (userWebsite' `assign` userUpdateWebsite)
          `combine` (userBio' `assign` userUpdateBio)
  _        <- updateWhere (userId' ==. userId) up
  user     <- selectFirstOr notFoundJSON (userId' ==. userId)
  userData <- extractUserData user
  respondJSON status200 userData

{-@ validateUser :: _ -> TaggedT<{\_ -> True}, {\v -> v == currentUser}> _ _ @-}
validateUser :: UserUpdate -> Controller ()
validateUser UserUpdate {..} = do
  whenT (T.length userUpdateDisplayName == 0) $ respondError status400 (Just "missing displayName")
  whenT (T.length userUpdateBio > 300) $ respondError status400 (Just "bio too long")

data UserUpdate = UserUpdate
  { userUpdatePhotoURL :: Maybe Text
  , userUpdateDisplayName :: Text
  , userUpdateInstitution :: Text
  , userUpdatePronouns:: Text
  , userUpdateWebsite:: Text
  , userUpdateBio:: Text
  }
  deriving Generic

instance FromJSON UserUpdate where
  parseJSON = genericParseJSON (stripPrefix "userUpdate")
