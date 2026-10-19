
from adminE.stats.modules.quants.bot_stats import BotStats
from adminE.stats.statistics import BaseStats


class AdminBotStats(BaseStats):
    def __init__(self, models):
        super().__init__(models)
        self.bot_stats = BotStats(models)

    def getBotStats(self):
        try:
            all_stats = self.bot_stats.all_bot_stats()
            return all_stats
        except Exception as e:
            self.logger.log(f"An error occurred: {e}", exc_info=True)
            return None