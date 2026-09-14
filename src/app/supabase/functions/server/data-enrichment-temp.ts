        if (isParked) {
          console.log(`⚠️ Parked domain detected for ${village.name}: ${village.website}`);
          console.log(`  🚨 Trigger keyword: \"${parkedIndicatorFound}\"`);
          await markVillageAsProcessed(village.id, 'skipped', `Parked domain detected (keyword: \"${parkedIndicatorFound}\")`);
          results.push({
            villageId: village.id,
            name: village.name,
            status: 'skipped',
            reason: `Parked domain detected (keyword: \"${parkedIndicatorFound}\")`,
            website: village.website
          });
          continue;
        }
