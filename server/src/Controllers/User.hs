{-# LANGUAGE RecordWildCards #-}
{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE DeriveGeneric #-}

{-@ LIQUID "--no-pattern-inline" @-}

module Controllers.User where

import qualified Data.Text                     as T
import           Data.Time.Clock                ( UTCTime
                                                , secondsToDiffTime
                                                , NominalDiffTime
                                                , addUTCTime
                                                )
import           GHC.Generics

import           Storm.Core
import           Storm.Actions
import           Storm.Updates
import           Storm.Insert
import           Storm.Filters
import           Storm.Helpers
import           Storm.Infrastructure
import           Storm.Templates
import           Storm.Frankie
import           Storm.Time
import           Storm.JSON

import           Controllers
import           Model
import           JSON
import           Control.Monad.Time             ( currentTime )

-- Time before a user is consider inactive without showing any activity.
inactiveTime :: NominalDiffTime
inactiveTime = 30

----------------------------------------------------------------------------------------------------
-- | User List
----------------------------------------------------------------------------------------------------

{-@ userList :: TaggedT<{\_ -> False}, {\_ -> True}> _ _ _ @-}
userList :: Controller ()
userList = do
  _     <- requireAuthUser
  users <- allUsers
  respondJSON status200 users

allUsers :: Controller [UserData]
allUsers = do
  users <- selectList trueF
  mapT extractUserData users

{-@ extractUserData :: _ -> TaggedT<{\_ -> True}, {\_ -> False}> _ _ _ @-}
extractUserData :: Entity User -> Controller UserData
extractUserData u = do
  visibility <- project userVisibility' u
  now        <- liftTIO currentTime
  lastSync   <- project userLastSync' u
  active     <- project userActive' u
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
    <*>    (if visibility == "public" then project userRoom' u else return Nothing)
    <*>    return (inactiveTime `addUTCTime` lastSync > now && active)

data UserData = UserData
  { userId :: UserId
  , userEmailAddress :: T.Text
  , userPhotoURL :: Maybe T.Text
  , userDisplayName :: T.Text
  , userInstitution :: T.Text
  , userPronouns :: T.Text
  , userWebsite :: T.Text
  , userBio:: T.Text
  , userLevel :: String
  , userRoom :: Maybe RoomId
  , userIsActive:: Bool
  }
  deriving Generic

instance ToJSON UserData where
  toEncoding = genericToEncoding (stripPrefix "user")

----------------------------------------------------------------------------------------------------
-- | User Get
----------------------------------------------------------------------------------------------------

{-@ userGet :: _ -> TaggedT<{\_ -> False}, {\_ -> True}> _ _ _ @-}
userGet :: UserIdOrMe -> Controller ()
userGet userIdOrMe = do
  viewer <- requireAuthUser
  userId <- case userIdOrMe of
    Me             -> project userId' viewer
    AUserId userId -> return userId
  user     <- selectFirstOr notFoundJSON (userId' ==. userId)
  userData <- extractUserData user
  respondJSON status200 userData

data UserIdOrMe = AUserId UserId | Me

instance Parseable UserIdOrMe where
  parseText t = if t == "me" then Just Me else fmap AUserId (parseText t)

----------------------------------------------------------------------------------------------------
-- | User Update
----------------------------------------------------------------------------------------------------

{-@ userUpdateMe :: TaggedT<{\_ -> False}, {\_ -> True}> _ _ _ @-}
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

{-@ validateUser :: _ -> TaggedT<{\_ -> True}, {\v -> v == currentUser 0}> _ _ _ @-}
validateUser :: UserUpdate -> Controller ()
validateUser UserUpdate {..} = do
  whenT (T.length userUpdateDisplayName == 0) $ respondError status400 (Just "missing displayName")
  whenT (T.length userUpdateBio > 300) $ respondError status400 (Just "bio too long")

data UserUpdate = UserUpdate
  { userUpdatePhotoURL :: Maybe T.Text
  , userUpdateDisplayName :: T.Text
  , userUpdateInstitution :: T.Text
  , userUpdatePronouns:: T.Text
  , userUpdateWebsite:: T.Text
  , userUpdateBio:: T.Text
  }
  deriving Generic

instance FromJSON UserUpdate where
  parseJSON = genericParseJSON (stripPrefix "userUpdate")
