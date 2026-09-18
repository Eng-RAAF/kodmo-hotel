/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as bootstrap from "../bootstrap.js";
import type * as guests from "../guests.js";
import type * as hotels from "../hotels.js";
import type * as housekeeping from "../housekeeping.js";
import type * as lib from "../lib.js";
import type * as notifications from "../notifications.js";
import type * as organization from "../organization.js";
import type * as payments from "../payments.js";
import type * as reservations from "../reservations.js";
import type * as roomTypes from "../roomTypes.js";
import type * as rooms from "../rooms.js";
import type * as seed from "../seed.js";
import type * as staff from "../staff.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  bootstrap: typeof bootstrap;
  guests: typeof guests;
  hotels: typeof hotels;
  housekeeping: typeof housekeeping;
  lib: typeof lib;
  notifications: typeof notifications;
  organization: typeof organization;
  payments: typeof payments;
  reservations: typeof reservations;
  roomTypes: typeof roomTypes;
  rooms: typeof rooms;
  seed: typeof seed;
  staff: typeof staff;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
