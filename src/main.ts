#!/usr/bin/env node

import SyncService from "@infrastructure/services/SyncService.js";
import ServerController from "@infrastructure/server/controllers/ServerController.js";

SyncService;
new ServerController(8080, true);
