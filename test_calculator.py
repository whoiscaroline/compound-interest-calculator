import unittest
from calculator import project


class ModelTests(unittest.TestCase):
    def test_no_contributions(self):
        self.assertAlmostEqual(project(monthly=0, years=10)[-1]['nominal'], 1000 * 1.07 ** 10)

    def test_zero_return(self):
        self.assertAlmostEqual(project(rate=0)[-1]['nominal'], 73000)

    def test_annuity(self):
        r = 1.07 ** (1 / 12) - 1
        expected = 1000 * (1 + r) ** 240 + 300 * ((1 + r) ** 240 - 1) / r
        self.assertAlmostEqual(project()[-1]['nominal'], expected)

    def test_invalid_inputs(self):
        for params in ({'years': 2.5}, {'initial': -1}, {'rate': -100}, {'monthly': float('nan')}):
            with self.assertRaises(ValueError):
                project(**params)


if __name__ == '__main__':
    unittest.main()
